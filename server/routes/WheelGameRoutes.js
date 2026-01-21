// routes/WheelGameRoutes.js
const express = require('express');
const { sendEmail } = require('../utils/emailService');
const crypto = require('crypto');

// The runWeightedDraw function is now passed in and is expected to work with the prize objects from the DB
module.exports = (authenticate, runWeightedDraw) => {
  const router = express.Router();

  //--- GET PRIZES FOR THE WHEEL (Public) ---
  router.get('/prizes', async (req, res) => {
    const supabase = req.app.get('supabase');

    try {
      const { data: prizes, error } = await supabase
        .from('wheel_prizes')
        .select('id, name, image_url, probability')
        .order('probability', { ascending: false });

      if (error) {
        console.error('Error fetching wheel prizes:', error);
        return res.status(500).json({ error: 'Could not fetch wheel prizes.' });
      }

      res.status(200).json(prizes);
    } catch (error) {
      console.error('Server error fetching prizes:', error);
      res.status(500).json({ error: 'An unexpected server error occurred.' });
    }
  });

//--- GET RECENT WINS (Public) ---
  router.get('/recent-wins', async (req, res) => {
    const supabase = req.app.get('supabase');

    try {
      const { data: recentWins, error } = await supabase
        .from('wheel_game_spins')
        .select(`
          id,
          created_at,
          user:profiles ( name ),
          prize:wheel_prizes!inner ( name )  // <--- ADD !inner HERE
        `)
        .neq('prize.name', 'No Prize') // Now this filter will actually work!
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) {
        console.error('Error fetching recent wins:', error);
        return res.status(500).json({ error: 'Could not fetch recent wins.' });
      }

      res.status(200).json(recentWins);
    } catch (error) {
      console.error('Server error fetching recent wins:', error);
      res.status(500).json({ error: 'An unexpected server error occurred.' });
    }
  });


  //--- SPIN THE WHEEL (Authenticated) ---
  router.post('/spin', authenticate, async (req, res) => {
    const supabase = req.app.get('supabase');
    const userId = req.user.id;

    try {
      // 1. Deduct a game token atomically
      const { error: rpcError } = await supabase.rpc('decrement_wheel_token', { user_id_in: userId });

      if (rpcError) {
        if (rpcError.message.includes('Insufficient tokens')) { //do not change this text, it's from the rpc function
          return res.status(402).json({ error: 'Insufficient tokens. Please purchase more to play.' });
        }
        console.error('RPC Token Deduction Error:', rpcError);
        return res.status(500).json({ error: 'Failed to use a game token.' });
      }

      // 2. Fetch prizes from the database to perform the draw
      const { data: prizes, error: prizeError } = await supabase
        .from('wheel_prizes')
        .select('id, name, probability');
        
      if (prizeError || !prizes || prizes.length === 0) {
        console.error('Error fetching prizes for draw:', prizeError);
        return res.status(500).json({ error: 'Could not retrieve prizes to perform the spin.' });
      }

      // 3. Generate a short code for the spin
      const spinCode = `SPN-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

      // 4. Run the weighted draw to determine the prize
      const drawResult = runWeightedDraw(prizes);
      const isWin = drawResult.name !== 'No Prize'; // Assuming "No Prize" indicates a loss...

      // 5. Log the spin result and get its ID
      const { data: spinData, error: logError } = await supabase
        .from('wheel_game_spins')
        .insert({
            user_id: userId,
            prize_id: drawResult.id,
            spin_code: spinCode // Save the new short code
        })
        .select('id, spin_code') // Select both the UUID and the new code
        .single();

      if (logError) {
        // Log the error. If it's a unique constraint violation on spin_code, we might want to retry.
        // For now, we'll just log it and the user won't get a code.
        console.error('Error logging game spin (potential code collision):', logError);
      }
      
      const gameSpinId = spinData ? spinData.id : null;
      const finalSpinCode = spinData ? spinData.spin_code : 'N/A'; // Use the code returned from DB

      // 6. If the user wins, record the reward, increment wins, and send email
      if (isWin) {
        // A) Record the win in the new wheel_rewards table
        const { error: rewardError } = await supabase.from('wheel_rewards').insert({
            user_id: userId,
            prize_id: drawResult.id,
            game_spin_id: gameSpinId,
            spin_code: finalSpinCode,
            prize_name: drawResult.name // Add prize_name here
        });

        if (rewardError) {
            console.error('CRITICAL: Failed to record win in wheel_rewards table:', rewardError);
        }

        // B) Increment total_wins
        const { error: winUpdateError } = await supabase.rpc('increment_total_wins', { user_id_in: userId });
        
        if (winUpdateError) {
          // Also not critical enough to fail the whole request
          console.error('Error incrementing total_wins:', winUpdateError);
        }

        // C) Send Email to the Winning User
        (async () => {
            try {
                // Fetch user auth data and profile data
                const [
                    { data: { user: authUser }, error: authUserError },
                    { data: profile, error: profileError }
                ] = await Promise.all([
                    supabase.auth.admin.getUserById(userId),
                    supabase.from('profiles').select('name, phone_number').eq('id', userId).single()
                ]);

                if (authUserError || !authUser || !authUser.email) {
                    return console.error('Error fetching winner auth user for wheel game:', authUserError);
                }

                if (profileError) {
                    console.warn('Could not fetch winner profile for email.', profileError);
                }

                const winnerEmail = authUser.email;
                const winnerName = profile?.name || 'Winner';
                const winnerPhone = profile?.phone_number || 'Not provided';

                const winnerHtml = `
                    <h3>🥳 Congratulations, ${winnerName}! You Won!</h3>
                    <p>We're thrilled to announce you won a <strong>${drawResult.name}</strong> from your spin on the Wheel of Fortune!</p>
                    <p>Your unique prize claim code is: <strong>${finalSpinCode}</strong>. Please provide this code when contacted by our team.</p>
                    <p>Your registered details are:</p>
                    <ul>
                        <li><strong>Name:</strong> ${winnerName}</li>
                        <li><strong>Email:</strong> ${winnerEmail}</li>
                        <li><strong>Phone:</strong> ${winnerPhone}</li>
                    </ul>
                    <p>Enjoy your day, and thank you for being a part of the Lucky Draw!</p>
                `;

                await sendEmail(
                    winnerEmail,
                    `🎉 You Won! Your Prize Claim Code: ${finalSpinCode}`,
                    winnerHtml
                );
                console.log(`✅ Winner email sent to ${winnerEmail} for prize: ${drawResult.name}`);

            } catch (winnerEmailErr) {
                console.error('❌ Error sending winner email for wheel game:', winnerEmailErr);
            }
        })();
      }

      // 7. Success Response
      res.status(200).json({
        message: 'Spin successful!',
        result: {
          prizeId: drawResult.id,
          prizeName: drawResult.name,
          isWinner: isWin,
          spinCode: finalSpinCode // Also return the code in the API response
        }
      });

    } catch (error) {
      console.error('Server error during spin:', error);
      res.status(500).json({ error: 'An unexpected server error occurred during your spin.' });
    }
  });

  return router;
};

