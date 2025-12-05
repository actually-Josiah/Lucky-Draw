// server/routes/AdminRoutes.js

const express = require('express');
const { isAdmin } = require('../utils/adminAuth');

module.exports = function (authenticate) {
    const router = express.Router();

    // Middleware to check for admin access on all routes in this file
    router.use((req, res, next) => {
        if (!isAdmin(req.user.email)) {
            return res.status(403).json({ error: 'Forbidden: Administrator access required.' });
        }
        next();
    });

    /**
     * @route GET /api/admin/stats
     * @description Fetches key dashboard statistics.
     * @access Admin only
     */
    router.get('/stats', async (req, res) => {
        const supabase = req.supabase;
        try {
            const [
                { data: revenueData, error: revenueError },
                { count: userCount, error: userError },
                { count: activeGamesCount, error: activeGamesError }
            ] = await Promise.all([
                supabase.from('payments').select('amount').eq('status', 'success'),
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('lucky_games').select('*', { count: 'exact', head: true }).eq('status', 'active')
            ]);

            if (revenueError || userError || activeGamesError) {
                console.error({ revenueError, userError, activeGamesError });
                throw new Error('Failed to fetch dashboard stats.');
            }

            const totalRevenue = revenueData.reduce((sum, p) => sum + p.amount, 0);

            res.status(200).json({
                totalRevenue: totalRevenue, // in pesewas
                totalUsers: userCount,
                activeGames: activeGamesCount
            });

        } catch (err) {
            console.error('Error fetching admin stats:', err);
            res.status(500).json({ error: err.message });
        }
    });

    /**
     * @route GET /api/admin/users
     * @description Fetches all user profiles along with their email addresses.
     * @access Admin only
     */
    router.get('/users', async (req, res) => {
        const supabase = req.supabase;

        try {
            let allAuthUsers = [];
            let page = 1;
            const perPage = 50; // Max per page for listUsers

            while (true) {
                const { data: { users: pageOfUsers }, error: pageError } = await supabase.auth.admin.listUsers({
                    page: page,
                    perPage: perPage,
                });

                if (pageError) {
                    console.error(`Error fetching page ${page} of auth users:`, pageError);
                    return res.status(500).json({ error: "Failed to fetch users' authentication data." });
                }

                allAuthUsers = allAuthUsers.concat(pageOfUsers);

                if (pageOfUsers.length < perPage) {
                    break; // Last page reached
                }

                page++;
            }
            
            // Fetch all profiles from the public schema
            const { data: profiles, error: profileError } = await supabase
                .from('profiles')
                .select('*');

            if (profileError) {
                console.error('Error fetching profiles:', profileError);
                return res.status(500).json({ error: 'Failed to fetch user profiles.' });
            }

            // Create a map of profiles by their ID for efficient lookup
            const profileMap = new Map(profiles.map(p => [p.id, p]));

            // Combine auth user data (for email) with profile data
            const combinedUsers = allAuthUsers.map(user => {
                const profile = profileMap.get(user.id) || {};
                return {
                    id: user.id,
                    email: user.email,
                    name: profile.name || 'N/A',
                    phone_number: profile.phone_number || 'N/A',
                    tokens: profile.available_game_sessions || 0,
                    joinedAt: user.created_at,
                    total_wins: profile.total_wins || 0,
                };
            });

            res.status(200).json(combinedUsers);

        } catch (err) {
            console.error('Server error in GET /users:', err);
            res.status(500).json({ error: 'An unexpected server error occurred.' });
        }
    });

    /**
     * @route GET /api/admin/notifications
     * @description Fetches all notifications.
     * @access Admin only
     */
    router.get('/notifications', async (req, res) => {
        const supabase = req.supabase;

        try {
            const { data: notifications, error } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching notifications:', error);
                return res.status(500).json({ error: 'Failed to fetch notifications.' });
            }

            res.status(200).json(notifications);
        } catch (err) {
            console.error('Server error in GET /notifications:', err);
            res.status(500).json({ error: 'An unexpected server error occurred.' });
        }
    });

    /**
     * @route POST /api/admin/notifications/mark-read
     * @description Marks specified notifications as read.
     * @access Admin only
     */
    router.post('/notifications/mark-read', async (req, res) => {
        const supabase = req.supabase;
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'An array of notification IDs is required.' });
        }

        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .in('id', ids);

            if (error) {
                console.error('Error marking notifications as read:', error);
                return res.status(500).json({ error: 'Failed to mark notifications as read.' });
            }

            res.status(200).json({ message: 'Notifications marked as read.' });
        } catch (err) {
            console.error('Server error in POST /notifications/mark-read:', err);
            res.status(500).json({ error: 'An unexpected server error occurred.' });
        }
    });

    /**
     * @route GET /api/admin/game-status
     * @description Fetches the current active game and the last closed game.
     * @access Admin only
     */
    router.get('/game-status', async (req, res) => {
        const supabase = req.supabase;
        try {
            const { data: activeGame, error: activeGameError } = await supabase
                .from('lucky_games')
                .select('*')
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (activeGameError) throw activeGameError;

            const { data: lastClosedGame, error: lastClosedGameError } = await supabase
                .from('lucky_games')
                .select('*')
                .eq('status', 'closed')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
            
            if (lastClosedGameError) throw lastClosedGameError;

            res.status(200).json({ activeGame, lastClosedGame });
        } catch (err) {
            console.error('Error fetching game status:', err);
            res.status(500).json({ error: 'Failed to fetch game status.' });
        }
    });

    /**
     * @route GET /api/admin/games/:id/entries
     * @description Fetches all entries for a specific game, including user names.
     * @access Admin only
     */
    router.get('/games/:id/entries', async (req, res) => {
        const supabase = req.supabase;
        const { id } = req.params;
        try {
            const { data, error } = await supabase
                .from('lucky_picks')
                .select(`
                    user_id,
                    number,
                    profile:profiles ( name )
                `)
                .eq('game_id', id);

            if (error) throw error;
            
            // Group picks by user
            const entriesMap = new Map();
            data.forEach(pick => {
                const { user_id, number, profile } = pick;
                if (!entriesMap.has(user_id)) {
                    entriesMap.set(user_id, {
                        userId: user_id,
                        userName: profile ? profile.name : 'N/A',
                        numbers: []
                    });
                }
                entriesMap.get(user_id).numbers.push(number);
            });

            const groupedEntries = Array.from(entriesMap.values());

            res.status(200).json(groupedEntries);
        } catch (err) {
            console.error(`Error fetching entries for game ${id}:`, err);
            res.status(500).json({ error: 'Failed to fetch game entries.' });
        }
    });

    /**
     * @route GET /api/admin/game-history
     * @description Fetches all games with 'revealed' status.
     * @access Admin only
     */
    router.get('/game-history', async (req, res) => {
        const supabase = req.supabase;
        try {
            const { data: revealedGames, error } = await supabase
                .from('lucky_games')
                .select('*')
                .eq('status', 'revealed')
                .order('created_at', { ascending: false });

            if (error) throw error;
            res.status(200).json(revealedGames);
        } catch (err) {
            console.error('Error fetching game history:', err);
            res.status(500).json({ error: 'Failed to fetch game history.' });
        }
    });

    /**
     * @route GET /api/admin/payments
     * @description Fetches all payments, including user names.
     * @access Admin only
     */
    router.get('/payments', async (req, res) => {
        const supabase = req.supabase;
        try {
            const { data, error } = await supabase
                .from('payments')
                .select(`
                    *,
                    profile:profiles ( name )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Flatten the profile data
            const formattedData = data.map(p => ({
                ...p,
                user_name: p.profile ? p.profile.name : 'N/A'
            }));

            res.status(200).json(formattedData);
        } catch (err) {
            console.error('Error fetching payments:', err);
            res.status(500).json({ error: 'Failed to fetch payments.' });
        }
    });

    /**
     * @route POST /api/admin/give-tokens
     * @description Gives a specified amount of tokens to a user.
     * @access Admin only
     */
    router.post('/give-tokens', async (req, res) => {
        const supabase = req.supabase;
        const { userId, tokenAmount } = req.body;

        if (!userId || !tokenAmount || !Number.isInteger(tokenAmount) || tokenAmount <= 0) {
            return res.status(400).json({ error: 'Valid userId and a positive integer tokenAmount are required.' });
        }

        try {
            const { error: rpcError } = await supabase.rpc('add_tokens', {
                user_id_in: userId,
                tokens_in: tokenAmount,
            });

            if (rpcError) {
                console.error('RPC Add Tokens Error:', rpcError);
                return res.status(500).json({ error: 'Failed to add tokens to user.' });
            }

            res.status(200).json({ message: `Successfully added ${tokenAmount} tokens to user ${userId}.` });
        } catch (err) {
            console.error('Server error in POST /give-tokens:', err);
            res.status(500).json({ error: 'An unexpected server error occurred.' });
        }
    });


    return router;
};
