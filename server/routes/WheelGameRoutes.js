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
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
                            <tr>
                                <td align="center">
                                    <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
                                        <!-- Header -->
                                        <tr>
                                            <td style="padding: 40px 40px 20px; text-align: center;">
                                                <div style="font-size: 64px; margin-bottom: 10px;">🎰</div>
                                                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Wo Suro A, Wo Nni</h1>
                                                <p style="color: rgba(255,255,255,0.85); margin: 5px 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Winner Notification</p>
                                            </td>
                                        </tr>
                                        <!-- Main Content -->
                                        <tr>
                                            <td style="padding: 0 20px 40px;">
                                                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden;">
                                                    <tr>
                                                        <td style="padding: 40px; text-align: center;">
                                                            <div style="font-size: 48px; margin-bottom: 15px;">🥳🎉</div>
                                                            <h2 style="color: #1f2937; margin: 0 0 10px; font-size: 24px;">Congratulations, ${winnerName}!</h2>
                                                            <p style="color: #6b7280; margin: 0 0 25px; font-size: 16px; line-height: 1.6;">You've just won an amazing prize from the Wheel of Fortune!</p>
                                                            
                                                            <!-- Prize Box -->
                                                            <div style="background: linear-gradient(135deg, #fef9e7 0%, #f7dc6f 100%); border-radius: 12px; padding: 25px; margin-bottom: 25px; border: 2px solid #d4af37;">
                                                                <p style="color: #8b6914; margin: 0 0 5px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Your Prize</p>
                                                                <h3 style="color: #7d5a00; margin: 0; font-size: 22px; font-weight: 700;">🏆 ${drawResult.name}</h3>
                                                            </div>
                                                            
                                                            <!-- Claim Code -->
                                                            <div style="background: linear-gradient(135deg, #fef9e7 0%, #fce588 100%); border-radius: 12px; padding: 20px; margin-bottom: 25px; border: 2px solid #d4af37;">
                                                                <p style="color: #8b6914; margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Your Claim Code</p>
                                                                <p style="color: #7d5a00; margin: 0; font-size: 28px; font-weight: 700; font-family: monospace; letter-spacing: 3px;">${finalSpinCode}</p>
                                                            </div>
                                                            
                                                            <p style="color: #6b7280; font-size: 14px; margin: 0 0 25px; line-height: 1.6;">Please keep this code safe. Our team will contact you shortly to arrange prize collection.</p>
                                                            
                                                            <!-- User Details -->
                                                            <div style="background-color: #fafafa; border-radius: 8px; padding: 20px; text-align: left; border-left: 4px solid #dc2626;">
                                                                <p style="color: #374151; margin: 0 0 12px; font-size: 13px; font-weight: 600;">📋 Your Registered Details:</p>
                                                                <p style="color: #6b7280; margin: 0 0 6px; font-size: 14px;"><strong>Name:</strong> ${winnerName}</p>
                                                                <p style="color: #6b7280; margin: 0 0 6px; font-size: 14px;"><strong>Email:</strong> ${winnerEmail}</p>
                                                                <p style="color: #6b7280; margin: 0; font-size: 14px;"><strong>Phone:</strong> ${winnerPhone}</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        <!-- Footer -->
                                        <tr>
                                            <td style="padding: 0 40px 30px; text-align: center;">
                                                <p style="color: rgba(255,255,255,0.85); margin: 0; font-size: 13px;">Thank you for playing Wo Suro A Wondi! 🎊</p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                    </html>
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

