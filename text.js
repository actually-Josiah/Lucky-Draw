// POST /api/lucky-grid/pick
router.post('/pick', authenticate, async (req, res) => {
    const supabase = req.supabase; // Use the fresh client
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
    const tokenCost = pickCount; // 1 token per pick ⬅️ FIXED: tokenCost definition restored

    try {
      // Health Check for Pick action
      const healthCheckResponse = await performHealthCheck(supabase, res);
      if (healthCheckResponse) return healthCheckResponse; 

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

if (profile.available_game_sessions < tokenCost) { // tokenCost is now defined
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
// (async () => { ... })
// ... (omitted for brevity, keep your existing email sending code here) ...
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
// --- END SEND CONFIRMATION EMAIL ---
      
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