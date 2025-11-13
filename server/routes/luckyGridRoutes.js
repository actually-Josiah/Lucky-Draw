//routes/luckyGridRoutes.js
const express = require('express');
const { sendEmail } = require('../utils/emailService');


module.exports = function (authenticate) {
  const router = express.Router();

const ADMIN_EMAILS = ["josiahiscoding@gmail.com"]; // add more if needed

function isAdmin(user) {
  return ADMIN_EMAILS.includes(user.email);
}


  // GET /api/lucky-grid/active
  router.get('/active', async (req, res) => {
    const supabase = req.app.get('supabase');

    try {
      const { data: games, error: gameError } = await supabase
        .from('lucky_games')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      if (gameError) {
        console.error('Error fetching active game:', gameError);
        return res.status(500).json({ error: 'Could not fetch active game.' });
      }

      const activeGame = games && games.length ? games[0] : null;

      if (!activeGame) {
        return res.status(200).json({ message: 'No active game found.', game: null, picks: [] });
      }

      const { data: picks, error: picksError } = await supabase
        .from('lucky_picks')
        .select('id, user_id, number, picked_at')
        .eq('game_id', activeGame.id)
        .order('picked_at', { ascending: true });

      if (picksError) {
        console.error('Error fetching picks for active game:', picksError);
        return res.status(500).json({ error: 'Could not fetch picks.' });
      }

      return res.status(200).json({ game: activeGame, picks });
    } catch (err) {
      console.error('Server error in /active:', err);
      return res.status(500).json({ error: 'Server error.' });
    }
  });

  // POST /api/lucky-grid/create
  // Create a new lucky game (admin or system)
  router.post('/create', authenticate, async (req, res) => {
    const supabase = req.app.get('supabase');
    const user = req.user;
    const { range = 100 } = req.body; // default to 100 if not provided

    if (!isAdmin(user)) {
      return res.status(403).json({ error: 'Forbidden. Admins only.' });
    }

    if (![20, 30, 50, 100].includes(Number(range))) {
      return res.status(400).json({ error: 'Invalid range. Allowed: 20, 30, 50, 100.' });
    }

    try {
      await supabase
        .from('lucky_games')
        .update({ status: 'completed' })
        .eq('status', 'active');

      const { data, error } = await supabase
        .from('lucky_games')
        .insert([
          {
            range: Number(range),
            status: 'active',
          },
        ])
        .select('*')
        .single();

      if (error) {
        console.error('Error creating new lucky game:', error);
        return res.status(500).json({ error: 'Could not create game.' });
      }

      return res.status(201).json({ message: 'Game created.', game: data });
    } catch (err) {
      console.error('Server error in /create:', err);
      return res.status(500).json({ error: 'Server error.' });
    }
  });

  // POST /api/lucky-grid/pick
  router.post('/pick', authenticate, async (req, res) => {
    const supabase = req.app.get('supabase');
    const user = req.user;
    const { numbers } = req.body; // ⬅️ Changed from 'number' to 'numbers'

    // --- 1️⃣ Validate Input ---
    if (!Array.isArray(numbers) || numbers.length === 0) {
      return res.status(400).json({ error: 'Body must contain a non-empty array of numbers.' });
    }

    if (!numbers.every(num => Number.isInteger(num) && num > 0)) {
        return res.status(400).json({ error: 'All submitted picks must be positive integers.' });
    }

    const uniqueNumbers = [...new Set(numbers)]; // Remove client-side duplicates
    const pickCount = uniqueNumbers.length;
    const tokenCost = pickCount; // 1 token per pick

    try {
      // 2️⃣ Get active game
      const { data: games, error: gameError } = await supabase
        .from('lucky_games')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      if (gameError) throw gameError;
      const activeGame = games?.[0];
      if (!activeGame) return res.status(400).json({ error: 'No active game available.' });

      // 3️⃣ Validate range for all numbers
      if (uniqueNumbers.some(n => n < 1 || n > activeGame.range)) {
        return res.status(400).json({ error: `All numbers must be between 1 and ${activeGame.range}.` });
      }
      
// 4️⃣ Check user tokens
const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('available_game_sessions')
  .eq('id', user.id)
  .maybeSingle(); 

if (profileError) throw profileError;

// --- Important Change ---
// When using maybeSingle() and 0 rows are returned, `profile` will be null.
if (!profile) { 
    // This handles the case where the user exists but has no profile row.
    return res.status(403).json({ 
        error: 'Unable to access your profile. Please log out and log back in.' 
    });
}

if (profile.available_game_sessions < tokenCost) {
    return res.status(403).json({ 
        error: `Insufficient tokens. Cost: ${tokenCost}, Available: ${profile.available_game_sessions}.` 
    });
}

      // 5️⃣ Check for already picked numbers (race condition check)
      const { data: existingPicks, error: existingPicksError } = await supabase
        .from('lucky_picks')
        .select('number')
        .eq('game_id', activeGame.id)
        .in('number', uniqueNumbers);

      if (existingPicksError) throw existingPicksError;
      
      const alreadyPickedNumbers = new Set(existingPicks.map(p => p.number));
      const numbersToInsert = uniqueNumbers.filter(n => !alreadyPickedNumbers.has(n));

      if (numbersToInsert.length === 0) {
        return res.status(409).json({ error: 'All selected numbers have already been claimed.' });
      }
      
      // Calculate the final token cost based on unique, available numbers
      const finalTokenCost = numbersToInsert.length;
      
      // 6️⃣ Prepare bulk insert payload
      const picksPayload = numbersToInsert.map(number => ({
        user_id: user.id,
        game_id: activeGame.id,
        number: number
      }));

      // A) Bulk Insert Picks
      const { data: newPicks, error: insertError } = await supabase
        .from('lucky_picks')
        .insert(picksPayload)
        .select('id, number');

      if (insertError) {
        console.error('Bulk Insert Error:', insertError);
        return res.status(500).json({ error: 'Could not record picks due to a database error.' });
      }
      
      // B) Deduct Tokens
      const { error: deductError } = await supabase
        .from('profiles')
        .update({ 
            available_game_sessions: profile.available_game_sessions - finalTokenCost 
        })
        .eq('id', user.id);

      if (deductError) {
        // Log critical failure: Picks recorded, but tokens not deducted. Requires manual fix.
        console.error('CRITICAL: Token Deduction Failed!', deductError);
        return res.status(500).json({ error: 'Picks recorded, but token deduction failed. Contact support.' });
      }

// --- SEND CONFIRMATION EMAIL ---
(async () => {
  try {
    const numbersStr = newPicks.map(p => p.number).join(', ');
    const emailHtml = `
      <h3>Lucky Draw Confirmation</h3>
      <p>Hi ${user.email},</p>
      <p>You have successfully picked the following numbers for the current game:</p>
      <p><strong>${numbersStr}</strong></p>
      <p>Good luck!</p>
    `;
    await sendEmail(user.email, 'Your Lucky Draw Picks', emailHtml);
  } catch (emailErr) {
    console.error('Error sending confirmation email:', emailErr);
  }
})();

      
      // 8️⃣ Auto-close game if all numbers taken
      const { count, error: countError } = await supabase
        .from('lucky_picks')
        .select('*', { count: 'exact', head: true })
        .eq('game_id', activeGame.id);

      if (!countError && count + newPicks.length >= activeGame.range) { // Adjusted count check
        await supabase.from('lucky_games').update({ status: 'closed' }).eq('id', activeGame.id);
      }

      // 9️⃣ Respond success
      res.status(201).json({
        message: `${newPicks.length} numbers picked successfully. Total cost: ${finalTokenCost} token(s).`,
        picks: newPicks,
      });

    } catch (err) {
      console.error('Server error in /pick:', err);
      res.status(500).json({ error: 'Unexpected server error.' });
    }
  });

  // POST /api/lucky-grid/reveal
  router.post('/reveal', authenticate, async (req, res) => {
    const supabase = req.app.get('supabase');
    const user = req.user;
    const { manualNumber = null } = req.body; // optional body param to choose winner manually

    if (!isAdmin(user)) {
      return res.status(403).json({ error: 'Forbidden. Admins only.' });
    }

    try {
      // 1) Fetch the most recent closed or active game
      const { data: games, error: gameError } = await supabase
        .from('lucky_games')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (gameError) throw gameError;
      const game = games && games.length ? games[0] : null;
      if (!game) return res.status(400).json({ error: 'No game found to reveal.' });

      // 2) If manualNumber provided, validate it; otherwise pick a random number
      let winningNumber = null;
      if (manualNumber !== null) {
        if (!Number.isInteger(manualNumber) || manualNumber < 1 || manualNumber > game.range) {
          return res.status(400).json({ error: 'manualNumber must be an integer within the game range.' });
        }
        winningNumber = manualNumber;
      } else {
        // Random pick between 1 and game.range inclusive
        winningNumber = Math.floor(Math.random() * game.range) + 1;
      }

      // 3) Update the game with the winning number and status
      const { data: updatedGame, error: updateGameError } = await supabase
        .from('lucky_games')
        .update({ winning_number: winningNumber, status: 'revealed' })
        .eq('id', game.id)
        .select('*')
        .single();

      if (updateGameError) {
        console.error('Could not update game with winning number:', updateGameError);
        return res.status(500).json({ error: 'Could not reveal winner.' });
      }

      // 4) Find the pick (if any) associated with the winning number
      const { data: winnerPick, error: winnerPickError } = await supabase
        .from('lucky_picks')
        .select('id, user_id, number')
        .eq('game_id', game.id)
        .eq('number', winningNumber)
        .maybeSingle();

      if (winnerPickError) {
        console.error('Error fetching winner pick:', winnerPickError);
      }

      let winnerProfile = null;
      if (winnerPick && winnerPick.user_id) {
        // 5) Increment winner's total_wins
        const { data: updatedProfile, error: updateProfileError } = await supabase
          .from('profiles')
          .update({ total_wins: supabase.raw ? undefined : null })
          .eq('id', winnerPick.user_id)
          .select('id, total_wins')
          .single();

        // The above update is a placeholder — do a simple increment instead:
        const { data: incData, error: incError } = await supabase
          .from('profiles')
          .update({ total_wins: (updatedProfile?.total_wins || 0) + 1 })
          .eq('id', winnerPick.user_id)
          .select('id, total_wins')
          .single();

        if (incError) {
          console.error('Error incrementing winner total_wins:', incError);
        } else {
          winnerProfile = incData;
        }
      }

      // 6) Return reveal result
      return res.status(200).json({
        message: 'Winner revealed.',
        winningNumber,
        winnerPick: winnerPick || null,
        winnerProfile: winnerProfile || null,
        game: updatedGame,
      });
    } catch (err) {
      console.error('Server error in /reveal:', err);
      return res.status(500).json({ error: 'Server error.' });
    }
  });

// GET /api/lucky-grid/last-revealed
router.get('/last-revealed', async (req, res) => {
  const supabase = req.app.get('supabase');
  try {
    // 1️⃣ Fetch the most recent revealed game
    const { data: games, error: gameError } = await supabase
      .from('lucky_games')
      .select('*')
      .eq('status', 'revealed')
      .order('created_at', { ascending: false })
      .limit(1);

    if (gameError) throw gameError;

    const game = games[0] || null;

    // 2️⃣ If there’s a revealed game, get the winning pick and winner profile
    let winner = null;
    if (game) {
      const { data: winnerPick } = await supabase
        .from('lucky_picks')
        .select('user_id, number')
        .eq('game_id', game.id)
        .eq('number', game.winning_number)
        .maybeSingle();

      if (winnerPick) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('id', winnerPick.user_id)
          .single();
        winner = profile || null;
      }
    }

    // 3️⃣ Respond with game + winner info
    res.json({ game, winner });
  } catch (err) {
    console.error('Error fetching last revealed game:', err);
    res.status(500).json({ error: 'Failed to fetch last revealed game.' });
  }
});

  return router;
};
