// routes/luckyGridRoutes.js

const express = require('express');
const { sendEmail } = require('../utils/emailService');
const cron = require('node-cron');


module.exports = function (authenticate) {
  const router = express.Router();

const ADMIN_EMAILS = ["josiahiscoding@gmail.com"]; // add more if needed

function isAdmin(user) {
  return ADMIN_EMAILS.includes(user.email);
}

// --- Helper function to handle the Supabase connection health check ---
// NOTE: Use req.supabase or req.app.get('supabase') depending on where you call this.
async function performHealthCheck(supabase, res) {
  const { error: healthError } = await supabase.rpc('now'); 
  if (healthError) {
    console.error('Supabase connection health check failed:', healthError);
    return res.status(503).json({ 
      error: 'Database connection failed to wake up. Please retry the request in a moment.',
      message: 'DB_WAKEUP_FAILED' // Custom marker for frontend troubleshooting
    });
  }
  return null; // Return null if successful
}


// GET /api/lucky-grid/active
router.get('/active', async (req, res) => {
  // 💡 CHANGE: Use req.supabase for the freshest client
  const supabase = req.supabase; 

  try {
    // 💡 Health Check
    const healthCheckResponse = await performHealthCheck(supabase, res);
    if (healthCheckResponse) return healthCheckResponse; // Returns 503 if failed
    
    // All subsequent database operations now rely on a live connection.
    const { data: games, error: gameError } = await supabase
      .from('lucky_games')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);

    if (gameError) {
      console.error('Error fetching active game:', gameError);
      // 💡 Added aggressive logging for diagnostics
      console.error('CRITICAL SUPABASE FETCH FAILURE:', JSON.stringify(gameError, null, 2));
      return res.status(500).json({ error: 'Could not fetch active game.' });
    }

    const activeGame = games && games.length ? games[0] : null;

    if (!activeGame) {
      return res.status(200).json({ message: 'No active game found.', game: null, picks: [] });
    }
// ... rest of the code remains the same ...
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
router.post('/create', authenticate, async (req, res) => {
  // 💡 CHANGE: Use req.supabase for the freshest client
  const supabase = req.supabase;
  const user = req.user;
// ... rest of the code remains the same ...
  const { range = 100 } = req.body; 

  if (!isAdmin(user)) {
    return res.status(403).json({ error: 'Forbidden. Admins only.' });
  }
// ... rest of the code remains the same ...
  if (![20, 30, 50, 100, 200, 500, 1000].includes(Number(range))) {
    return res.status(400).json({ error: 'Invalid range. Allowed: 20, 30, 50, 100, 200, 500 and 1000.' });
  }

  try {
    // Health Check for Admin actions
    const healthCheckResponse = await performHealthCheck(supabase, res);
    if (healthCheckResponse) return healthCheckResponse; 
// ... rest of the code remains the same ...
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
  // 💡 CHANGE: Use req.supabase for the freshest client
  const supabase = req.supabase;
  const user = req.user;
// ... rest of the code remains the same ...
  const { numbers } = req.body; 

  // --- 1️⃣ Validate Input ---
  if (!Array.isArray(numbers) || numbers.length === 0) {
    return res.status(400).json({ error: 'Body must contain a non-empty array of numbers.' });
  }
// ... rest of the code remains the same ...
  if (!numbers.every(num => Number.isInteger(num) && num > 0)) {
      return res.status(400).json({ error: 'All submitted picks must be positive integers.' });
  }

  const uniqueNumbers = [...new Set(numbers)]; // Remove client-side duplicates
  const pickCount = uniqueNumbers.length; // 1 token per pick
  const tokenCost = pickCount; 

  try {
    // Health Check for Pick action
    const healthCheckResponse = await performHealthCheck(supabase, res);
    if (healthCheckResponse) return healthCheckResponse; 

    // 2️⃣ Get active game
    const { data: games, error: gameError } = await supabase
      .from('lucky_games')
      .select('*')
      .eq('status', 'active')
// ... rest of the code remains the same ...
      .order('created_at', { ascending: false })
      .limit(1);

    if (gameError) throw gameError;
    const activeGame = games?.[0];
    if (!activeGame) return res.status(400).json({ error: 'No active game available.' });
// ... rest of the code remains the same ...
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
// ... rest of the code remains the same ...
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
// ... rest of the code remains the same ...
    if (existingPicksError) throw existingPicksError;
    
    const alreadyPickedNumbers = new Set(existingPicks.map(p => p.number));
    const numbersToInsert = uniqueNumbers.filter(n => !alreadyPickedNumbers.has(n));

    if (numbersToInsert.length === 0) {
      return res.status(409).json({ error: 'All selected numbers have already been claimed.' });
    }
    
    // Calculate the final token cost based on unique, available numbers
    const finalTokenCost = numbersToInsert.length;
// ... rest of the code remains the same ...
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
      <h3>Wo Suro A Wondi Draw Confirmation</h3>
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
const { count: totalPicks, error: countError } = await supabase
  .from('lucky_picks')
  .select('*', { count: 'exact', head: true })
  .eq('game_id', activeGame.id);

if (!countError && totalPicks >= activeGame.range) {
  await supabase
    .from('lucky_games')
    .update({ status: 'closed' })
    .eq('id', activeGame.id);

  console.log(`🔒 Game ${activeGame.id} closed automatically.`);
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
  // 💡 CHANGE: Use req.supabase for the freshest client
  const supabase = req.supabase;
  const user = req.user;
// ... rest of the code remains the same ...
  const { manualNumber = null } = req.body; 

  if (!isAdmin(user)) {
    return res.status(403).json({ error: 'Forbidden. Admins only.' });
  }

  try {
    // Health Check for Admin actions
    const healthCheckResponse = await performHealthCheck(supabase, res);
    if (healthCheckResponse) return healthCheckResponse; 
    
    // 1) Fetch the most recent closed or active game
    const { data: games, error: gameError } = await supabase
      .from('lucky_games')
// ... rest of the code remains the same ...
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (gameError) throw gameError;
    const game = games && games.length ? games[0] : null;
    if (!game) return res.status(400).json({ error: 'No game found to reveal.' });
// ... rest of the code remains the same ...
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
// ... rest of the code remains the same ...
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
let winnerAuthUser = null;

if (winnerPick && winnerPick.user_id) {

// 5️⃣ Increment total wins (atomic update using RPC)
const { error: rpcError } = await supabase.rpc('increment_total_wins', {
  user_id_in: winnerPick.user_id,
});

if (rpcError) {
  console.error('Error incrementing total_wins using RPC:', rpcError);
} else {
  console.log(`✅ Total wins incremented via RPC for user ${winnerPick.user_id}`);
}

// 6️⃣ Fetch the updated profile data (Now we perform a separate fetch to get the NEW total_wins)
const { data: profileDetails, error: profileDetailsError } = await supabase
  .from('profiles')
  .select('id, name, phone_number, total_wins')
  .eq('id', winnerPick.user_id)
  .single(); // We use .single() here because the row *must* exist if the RPC succeeded.

if (!profileDetailsError) {
  winnerProfile = profileDetails;
} else {
  console.error('Error fetching updated winner profile:', profileDetailsError);
}

  // 7) Fetch email from auth.users
  const { data: authUserData, error: authUserError } = await supabase.auth.admin.getUserById(
    winnerPick.user_id
  );

  if (!authUserError) {
    winnerAuthUser = authUserData.user;
  }
}


// --- 8 Return reveal result + send admin email ---
try {
const adminHtml = `
  <h3>🎉 Lucky Draw Game Ended</h3>
  <p><strong>Game ID:</strong> ${updatedGame.id}</p>
  <p><strong>Winning Number:</strong> ${winningNumber}</p>

  <h4>🏆 Winner Details:</h4>
  ${
    winnerProfile
      ? `
        <p><strong>Name:</strong> ${winnerProfile.name || 'N/A'}</p>
        <p><strong>Phone:</strong> ${winnerProfile.phone_number || 'N/A'}</p>
        <p><strong>Email:</strong> ${winnerAuthUser?.email || 'N/A'}</p>
      `
      : '<p>No winner for this round.</p>'
  }
`;


  // You can have multiple admin emails if you want
  const ADMIN_EMAILS = [
    process.env.ADMIN_EMAIL || 'josiahiscoding@gmail.com'
  ];

  for (const adminEmail of ADMIN_EMAILS) {
    await sendEmail(
      adminEmail,
      `🎯 Lucky Draw Results for Game ${updatedGame.id}`,
      adminHtml
    );
  }

  console.log('✅ Admin email(s) sent successfully');
} catch (err) {
  console.error('❌ Error sending admin email:', err);
}

// 🏆 NEW CODE BLOCK: Send Email to the Winning User
if (winnerAuthUser?.email && winnerPick?.user_id) {
    try {
        const winnerName = winnerProfile?.name || "Winner";
        const winnerHtml = `
            <h3>🥳 Congratulations, ${winnerName}! You Won!</h3>
            <p>We're thrilled to announce you won this week's <strong> Wo Sura A Wondi</strong> draw with your lucky number: <strong>${winningNumber}</strong>!</p>
            <p>Our team will get in touch with you shortly on your registered phone number or email to discuss how to claim your prize.</p>
            <p>Enjoy your day, and thank you for being a part of the Lucky Draw!</p>
        `;
        
        await sendEmail(
            winnerAuthUser.email,
            `🎉 You Won the Lucky Draw! Winning Number: ${winningNumber}`,
            winnerHtml
        );
        console.log(`✅ Winner email sent successfully to ${winnerAuthUser.email}`);
        
    } catch (winnerEmailErr) {
        console.error('❌ Error sending winner email:', winnerEmailErr);
    }
}

// Finally, respond to client
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

// GET /api/lucky-grid/last-revealed (MODIFIED)
router.get('/last-revealed', async (req, res) => {
  // 💡 CHANGE: Use req.supabase for the freshest client
  const supabase = req.supabase;
  try {
    // 💡 Health Check
    const healthCheckResponse = await performHealthCheck(supabase, res);
    if (healthCheckResponse) return healthCheckResponse; // Returns 503 if failed

    // 1️⃣ Fetch the most recent revealed game
    const { data: games, error: gameError } = await supabase
// ... rest of the code remains the same ...
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
// ... rest of the code remains the same ...
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

// GET /api/lucky-grid/closed (MODIFIED)
router.get('/closed', async (req, res) => {
  // 💡 CHANGE: Use req.supabase for the freshest client
  const supabase = req.supabase;

  try {
    // 💡 Health Check
    const healthCheckResponse = await performHealthCheck(supabase, res);
    if (healthCheckResponse) return healthCheckResponse; // Returns 503 if failed

    const { data, error } = await supabase
// ... rest of the code remains the same ...
      .from('lucky_games')
      .select('*')
      .eq('status', 'closed')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;
// ... rest of the code remains the same ...
    if (!data || data.length === 0) {
      return res.json({ game: null });
    }

    return res.json({ game: data[0] });

  } catch (err) {
    console.error("Error fetching closed game:", err);
    return res.status(500).json({ error: "Server error." });
  }
});


// Run every day at 21:00 (9 PM server time)
cron.schedule('0 21 * * *', async () => {
  // ⚠️ CRON FIX: Initialize a fresh client specifically for the cron job
  const supabase = getSupabaseClient(); // Assuming getSupabaseClient is accessible here
  if (!supabase) return console.error('Supabase client not available for cron job.');

  try {
    // ⚠️ CRON Health Check: Perform one check before running large query loops
    const { error: healthError } = await supabase.rpc('now'); 
    if (healthError) {
      return console.error('Cron job DB connection health check failed, skipping run:', healthError);
    }
    // End Health Check
// ... rest of the code remains the same ...
    const { data: activeGames } = await supabase
      .from('lucky_games')
      .select('*')
      .eq('status', 'active');

    for (const game of activeGames) {
      const { data: picks } = await supabase
        .from('lucky_picks')
        .select('user_id, number')
        .eq('game_id', game.id);
// ... rest of the code remains the same ...
      // Notify each user with their picks + remaining numbers
      const userIds = [...new Set(picks.map(p => p.user_id))];

      for (const userId of userIds) {
        const userPicks = picks.filter(p => p.user_id === userId).map(p => p.number);
        const remaining = game.range - picks.length;

        const { data: userProfile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', userId)
          .maybeSingle();

        if (userProfile?.email) {
          const html = `
            <h3>Lucky Draw Daily Update</h3>
            <p>Your picks so far: <strong>${userPicks.join(', ')}</strong></p>
            <p>Numbers remaining: ${remaining}</p>
          `;
          sendEmail(userProfile.email, 'Daily Lucky Draw Update', html);
        }
      }
    }
  } catch (err) {
    console.error('Error sending daily update emails:', err);
  }
});
  return router;
};