// server.js

require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors'); 
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3001;

// 🛑 REMOVED: Global Supabase Initialization (We now initialize per request)
// const supabase = createClient(...)
// app.set('supabase', supabase); // Also removed

// --- Supabase Initialization Function ---
// 💡 NEW: Function to create a fresh client instance.
const getSupabaseClient = () => {
    return createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY,
        { auth: { persistSession: false } } 
    );
}

// --- Prize Config ---
const { PRIZES, CATEGORY_CONFIG } = require('./config/prizes');


// Helper to determine the outcome based on weighted probability
function runWeightedDraw(config) {
  const totalWeight = config.reduce((sum, item) => sum + item.probability, 0);
  const randomNumber = Math.random() * totalWeight;
  let cumulative = 0;

  for (const item of config) {
    cumulative += item.probability;
    if (randomNumber < cumulative) {
      return item;
    }
  }

  return config[config.length - 1];
}


// --- Middleware Setup ---
const allowedOrigins = [
  "http://localhost:3000",
  "http://10.21.136.216:3000",
  "https://homefoodstuffluckydraw.netlify.app",
  "https://wosuraawonni.cloud"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// --- Dynamic Supabase Middleware ---
// 💡 NEW: Attach a fresh Supabase client to the request object and the app.
function attachSupabaseClient(req, res, next) {
    const supabase = getSupabaseClient();
    req.supabase = supabase; // Used in updated routes (best practice)
    req.app.set('supabase', supabase); // Used in legacy routes (compatibility)
    next();
}

app.use('/api/paystack-webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// 💡 APPLY THE NEW DYNAMIC CLIENT MIDDLEWARE TO ALL /API ENDPOINTS
app.use('/api', attachSupabaseClient); 

// --- Middleware: Verify Supabase JWT Token ---
async function authenticate(req, res, next) {
  // Client is now guaranteed to be fresh via attachSupabaseClient middleware
  const supabase = req.app.get('supabase'); 

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token not provided or is invalid.' });
  }

  const token = authHeader.split(' ')[1];

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    console.error('JWT Verification Error:', error ? error.message : 'No user found.');
    return res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
  }

  req.user = user; 
  next(); 
}

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Lucky Draw API is running and Supabase is initialized!' });
});

// --- API Route 1: SENDING THE OTP (Registration) ---
app.post('/api/register-otp', async (req, res) => {
  const supabase = req.app.get('supabase');

  const { email } = req.body; 
// ... rest of the code remains the same ...
  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  // Use Supabase to send the OTP (Magic Link/Passwordless Auth)
  const { data, error } = await supabase.auth.signInWithOtp({
    email: email, 
  });

  if (error) {
    console.error('Supabase OTP Error:', error);
    return res.status(500).json({ error: 'Could not send OTP. Please check the email and try again.' });
  }

  res.status(200).json({ 
    message: 'Magic link or OTP sent successfully. Check your email!',
  });
});

// --- API Route 2: VERIFYING THE OTP (Login) - UPDATED TO CREATE PROFILE ---
app.post('/api/verify-otp', async (req, res) => {
  const supabase = req.app.get('supabase');
  const { email, token } = req.body;
// ... rest of the code remains the same ...
  if (!email || !token) {
    return res.status(400).json({ error: 'Email and verification token are required.' });
  }

  // 1️⃣ Verify OTP and get the user
  const { data: authData, error: authError } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });

  if (authError) {
    console.error(`[${new Date().toISOString()}] Supabase Verification Error:`, authError);
    return res.status(401).json({ error: 'Invalid or expired code. Please try again.' });
  }

  const { user, session } = authData;

  // 2️⃣ Log profile creation attempts
  console.log(`[${new Date().toISOString()}] [VERIFY-OTP] Checking/creating profile for user ${user.id} (${email})`);

  // 3️⃣ Upsert profile atomically (safe for multiple devices/logins)
  const { error: upsertError } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        available_game_sessions: 0,
        total_wins: 0,
      },
      { onConflict: 'id' }
    );

  if (upsertError) {
    console.error(`[${new Date().toISOString()}] [VERIFY-OTP] Profile upsert error for ${user.id}:`, upsertError);
  } else {
    console.log(`[${new Date().toISOString()}] [VERIFY-OTP] Profile ensured for user ${user.id}`);
  }

  // 4️⃣ Respond to client
  res.status(200).json({
    message: 'Login successful!',
    user,
    session,
  });
});


// --- API Route 3: UPDATE USER PROFILE DETAILS (Authenticated) ---
app.put('/api/profile', authenticate, async (req, res) => {
  const supabase = req.app.get('supabase');
  
  const userId = req.user.id; 
// ... rest of the code remains the same ...
  const { name, phone_number } = req.body; 

  if (!name && !phone_number) {
    return res.status(400).json({ error: 'At least a name or a phone number must be provided for the update.' });
  }

  const updateFields = {};
  if (name) {
    updateFields.name = name;
  }
  if (phone_number) {
    updateFields.phone_number = String(phone_number).trim();
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updateFields)
      .eq('id', userId) 
      .select('id, name, phone_number, available_game_sessions, total_wins');

    if (error) {
      console.error('Supabase Profile Update Error:', error);
      return res.status(500).json({ error: 'Could not update profile. Database error.' });
    }
    
    if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Profile not found. Please log in again.' });
    }

    res.status(200).json({ 
      message: 'Profile updated successfully!',
      updatedProfile: data[0]
    });

  } catch (error) {
    console.error('Server error during profile update:', error);
    res.status(500).json({ error: 'An unexpected server error occurred.' });
  }
});


// --- API Route 4: FETCH DASHBOARD DATA (Authenticated) ---
app.get('/api/dashboard', authenticate, async (req, res) => {
  const supabase = req.app.get('supabase');
  const userId = req.user.id; 
// ... rest of the code remains the same ...
  try {
    // 1. **Fetch User-Specific Data**
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('name, phone_number, available_game_sessions, total_wins') 
      .eq('id', userId) 
      .single(); 

    if (userError && userError.code !== 'PGRST116') {
         throw new Error(userError.message);
    }
    
    // 2. **Fetch Global Data (Leaderboard)**
    const { data: leaderboardData, error: leaderboardError } = await supabase
      .from('profiles') // Assuming profiles is also used for a simple leaderboard
      .select('name, total_wins') 
      .order('total_wins', { ascending: false }) 
      .limit(5);

    if (leaderboardError) {
      console.warn('Could not fetch leaderboard data:', leaderboardError);
    }

    // 3. **Combine and Respond**
    res.status(200).json({ 
      message: 'Dashboard data fetched successfully.',
      user: {
        id: userId,
        email: req.user.email, 
        // Use userData if available, otherwise defaults
        name: userData?.name || null,
        phone_number: userData?.phone_number || null,
        gameTokens: userData?.available_game_sessions ?? 0,
        totalWins: userData?.total_wins ?? 0,
      },
      leaderboardPreview: leaderboardData || [],
      rewards: [ { name: '10% Off'}, { name: 'Free Coffee' } ] // Mock Rewards
    });

  } catch (error) {
    console.error('Server error during dashboard fetch:', error);
    res.status(500).json({ error: 'An unexpected server error occurred while fetching dashboard data.' });
  }
});

// --- API Route: PAYSTACK WEBHOOK HANDLER ---
app.post('/api/paystack-webhook', async (req, res) => {
    const supabase = req.app.get('supabase');
    const secret = process.env.PAYSTACK_SECRET_KEY;
// ... rest of the code remains the same ...
    const hash = req.headers['x-paystack-signature'];

    const expectedHash = crypto.createHmac('sha512', secret)
                               .update(req.body)
                               .digest('hex');

    if (hash !== expectedHash) {
        console.warn('Paystack Webhook: Invalid signature received.');
        return res.status(400).send('Invalid signature.');
    }

    const event = JSON.parse(req.body.toString('utf8'));

    if (event.event === 'charge.success') {
        const { metadata } = event.data;
        
        if (!metadata || !metadata.user_id || !metadata.tokens_to_add) {
            console.error('Webhook Error: Missing required metadata.');
            return res.status(400).end();
        }

        const userId = metadata.user_id;
        const tokensToAdd = metadata.tokens_to_add;

        try {
            const { error: rpcError } = await supabase.rpc('add_tokens', {
                user_id_in: userId,
                tokens_in: tokensToAdd,
            });

            if (rpcError) {
                console.error('RPC Token Update Error:', rpcError);
                return res.status(500).end();
            }

            console.log(`✅ Tokens added for user ${userId} → +${tokensToAdd}`);
            return res.status(200).end();

        } catch (dbError) {
            console.error('Database error during token update:', dbError);
            return res.status(500).end();
        }
    }

    res.status(200).end();
});

const sidegameRoutes = require('./routes/sidegameRoutes');
app.use('/api', sidegameRoutes(authenticate, CATEGORY_CONFIG, PRIZES, runWeightedDraw));

const createLuckyGridRoutes = require('./routes/luckyGridRoutes');
app.use('/api/lucky-grid', createLuckyGridRoutes(authenticate));


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});