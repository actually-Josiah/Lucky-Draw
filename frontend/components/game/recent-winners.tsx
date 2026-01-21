// components/game/recent-winners.tsx
"use client";

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { Award, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Winner {
  id: string;
  created_at: string;
  user: { name: string | null } | null;
  prize: { name: string | null } | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const SPIN_DURATION_MS = 15000; // Match to  wheel spin duration

export default function RecentWinners() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // 1. Fetch initial winners
    const fetchInitialWinners = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/wheel-game/recent-wins`);
        if (!response.ok) {
          throw new Error('Failed to fetch recent winners');
        }
        const data: Winner[] = await response.json();
        setWinners(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialWinners();

    // 2. Subscribe to real-time updates
    const handleNewWin = (payload: RealtimePostgresChangesPayload<Winner>) => {
      // SPOILER FIX: Wait for the wheel to finish spinning before showing the result
      setTimeout(async () => {
        
        const spinId = payload.new.id;
        if (!spinId) return;

        console.log(`[Realtime] Processing spin ID: ${spinId}`);
        
        // We need to fetch the joined data (User Name + Prize Name) because 
        // the realtime payload only contains raw IDs.
        const { data, error } = await supabase
          .from('wheel_game_spins')
          .select('id, created_at, user:profiles ( name ), prize:wheel_prizes ( name )')
          .eq('id', spinId)
          .single();
        
        if (error) {
          console.error("[Realtime] Error fetching spin details:", error);
          return;
        }

        // Only add to the list if it is a valid prize (Not 'No Prize')
        if (data && data.prize && data.prize.name !== 'No Prize') {
          setWinners(currentWinners => {
            // Prevent duplicates
            if (currentWinners.some(w => w.id === data.id)) return currentWinners;
            
            // Add new winner to the top and keep list size at 8
            return [data as Winner, ...currentWinners].slice(0, 8);
          });
        }
      }, SPIN_DURATION_MS);
    };

    const channel = supabase
      .channel('recent-wins')
      .on<Winner>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'wheel_game_spins' },
        handleNewWin
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };

  }, [supabase]);

return (
    // 1. Changed border to exclude the bottom (border-b-0) and added a gradient mask to the whole container
    <div className="w-full max-w-sm p-4 bg-black/30 backdrop-blur-md rounded-t-lg border-t border-x border-b-0 border-white/10 shadow-lg relative">
      
      <h3 className="text-xl font-bold text-white mb-4 text-center drop-shadow-md">
        Recent Winners
      </h3>

      {/* 2. Added a max-height and the 'mask-image' gradient to create the fade effect */}
      <div 
        className="space-y-3 max-h-[400px] overflow-hidden [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]"
      >
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode='popLayout'>
            {winners.map(winner => (
              <motion.div
                key={winner.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }} // Items fade down when leaving
                transition={{ duration: 0.4 }}
                className="p-3 bg-gradient-to-r from-white/10 to-transparent rounded-md border-l-2 border-red-500/50 backdrop-blur-sm"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-red-500/20 rounded-full mr-3">
                    <Award className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white truncate text-sm">
                      {winner.user?.name || 'Hidden User'}
                    </p>
                    <p className="text-xs text-gray-300">
                      won <span className="font-bold text-red-300">{winner.prize?.name || 'a prize'}</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        
        {!loading && winners.length === 0 && (
          <div className="text-center text-gray-500 py-8 text-sm italic">
            No winners yet... spins incoming!
          </div>
        )}
        
        {/* Spacer to ensure the last item isn't fully faded out if the list is short */}
        <div className="h-12 w-full"></div>
      </div>
    </div>
  );
}