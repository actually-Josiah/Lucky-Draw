// routes/gameRoutes.js
const express = require('express');

module.exports = (authenticate, CATEGORY_CONFIG, PRIZES, runWeightedDraw) => {
  const router = express.Router();

  // --- API Route 5: START GAME SESSION (Authenticated) ---
  router.post('/start-session', authenticate, async (req, res) => {
    const supabase = req.app.get('supabase');
    const userId = req.user.id;

    // 1. Check for existing active session
    const { data: activeSession, error: checkError } = await supabase
      .from('game_sessions')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (checkError) {
      console.error('Check Active Session Error:', checkError);
      return res.status(500).json({ error: 'Database error checking session state.' });
    }

    if (activeSession && activeSession.length > 0) {
      return res.status(409).json({
        error: 'You already have an active game session. Complete or lose the current one first.',
        sessionId: activeSession[0].id
      });
    }

    try {
      // 2. Deduct a game token atomically using RPC
      const { error: rpcError } = await supabase.rpc('decrement_game_token', {
        user_id_in: userId
      });

      if (rpcError) {
        console.error('RPC Token Deduction Error:', rpcError);
        return res.status(500).json({ error: 'Failed to deduct game token.' });
      }

      // 3. Create new session
      const { data: newSession, error: sessionError } = await supabase
        .from('game_sessions')
        .insert({
          user_id: userId,
          attempts_remaining: 3,
        })
        .select('id, attempts_remaining, start_time')
        .single();

      if (sessionError) {
        console.error('Session Creation Error:', sessionError);
        return res.status(500).json({ error: 'Could not initialize game session.' });
      }

      res.status(200).json({
        message: 'Game session started!',
        sessionId: newSession.id,
        attempts: newSession.attempts_remaining,
      });
    } catch (error) {
      console.error('Server error during session start:', error);
      res.status(500).json({ error: 'Unexpected server error during session start.' });
    }
  });

  // --- API Route 6: PULL CARD (Game Action) ---
  router.post('/pull-card/:sessionId', authenticate, async (req, res) => {
    const supabase = req.app.get('supabase');
    const userId = req.user.id;
    const { sessionId } = req.params;

    // 1. Fetch and Verify Active Session
    const { data: session, error: fetchError } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !session) {
      console.error('Session Fetch Error:', fetchError);
      return res.status(404).json({ error: 'Game session not found or does not belong to user.' });
    }

    if (!session.is_active || session.has_won_prize || session.attempts_remaining <= 0) {
      return res.status(403).json({ error: 'This game session is no longer active or has finished.' });
    }

    // 2. Run the Category Draw
    const categoryDraw = runWeightedDraw(CATEGORY_CONFIG);

    let drawResult;
    if (categoryDraw.category === 'none') {
      // "Loss" result
      drawResult = { category: 'none', reward_text: 'Loss', name: 'No Prize' };
    } else {
      // Pick a random prize from that category
      const categoryPrizes = PRIZES[categoryDraw.category];
      drawResult = categoryPrizes[Math.floor(Math.random() * categoryPrizes.length)];
      drawResult.category = categoryDraw.category;
    }

    const isWin = drawResult.category !== 'none';

    // 3. Calculate New State
    let newAttempts = session.attempts_remaining - 1;
    let isSessionActive = true;
    let hasWonPrize = session.has_won_prize;
    let rewardWonName = session.reward_won_name;
    let duration_ms = session.duration_ms;
    let endTime = null;
    let totalWinsUpdate = 0;

    if (isWin) {
      hasWonPrize = true;
      isSessionActive = false;
      rewardWonName = drawResult.reward_text;
      totalWinsUpdate = 1;
      endTime = new Date();

      // Calculate duration for leaderboard if "main" prize
      if (drawResult.category === 'main') {
        const startTime = new Date(session.start_time);
        duration_ms = endTime.getTime() - startTime.getTime();
      }
    }

    if (newAttempts <= 0 || hasWonPrize) {
      isSessionActive = false;
    }

    // 4. Update the game_sessions table
    const { data: updatedSession, error: updateError } = await supabase
      .from('game_sessions')
      .update({
        attempts_remaining: newAttempts,
        is_active: isSessionActive,
        has_won_prize: hasWonPrize,
        reward_won_name: rewardWonName,
        end_time: endTime,
        duration_ms: duration_ms,
      })
      .eq('id', sessionId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Session update error:', updateError);
      return res.status(500).json({ error: 'Failed to update game session.' });
    }

    // 5. Update profile total_wins if a prize was won
    if (totalWinsUpdate > 0) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('total_wins')
        .eq('id', userId)
        .single();

      if (!profileError && profile) {
        const newTotalWins = (profile.total_wins || 0) + totalWinsUpdate;
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({ total_wins: newTotalWins })
          .eq('id', userId);

        if (profileUpdateError) {
          console.error('Profile update error:', profileUpdateError);
        }
      } else {
        console.error('Profile fetch error:', profileError);
      }
    }

    // 6. Success Response
    res.status(200).json({
      message: 'Card pulled successfully!',
      result: {
        outcome: drawResult.reward_text,
        prizeName: drawResult.name,
        category: drawResult.category,
        isWinner: isWin,
        duration: duration_ms,
      },
      session: {
        id: updatedSession.id,
        isActive: updatedSession.is_active,
        attemptsRemaining: updatedSession.attempts_remaining,
        hasWonPrize: updatedSession.has_won_prize,
      }
    });
  });

// --- API Route 7: FETCH LEADERBOARD (Top Main Prize Winners) ---
router.get('/leaderboard', async (req, res) => {
  const supabase = req.app.get('supabase');

  try {
    const { data, error } = await supabase
      .from('game_sessions')
      .select(`
        id,
        duration_ms,
        reward_won_name,
        user_id,
        profiles (name)
      `)
      .ilike('reward_won_name', '%Main_Prize%')
      .order('duration_ms', { ascending: true })
      .limit(10);

    if (error) {
      console.error('Leaderboard fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch leaderboard data.' });
    }

    const leaderboard = data.map((entry, index) => ({
      rank: index + 1,
      name: entry.profiles?.name || 'Anonymous Player',
      timeTaken: (entry.duration_ms / 1000).toFixed(2) + 's',
    }));

    res.status(200).json({
      message: 'Leaderboard fetched successfully.',
      leaderboard,
    });

  } catch (error) {
    console.error('Server error fetching leaderboard:', error);
    res.status(500).json({ error: 'Unexpected server error while fetching leaderboard.' });
  }
});


  return router;
};
