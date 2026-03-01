// components/game/recent-winners.tsx
"use client";

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { Award, Loader2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Winner {
  id: string;
  created_at: string;
  user: { name: string | null } | null;
  prize: { name: string | null } | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const SPIN_DURATION_MS = 15000; // Match to wheel spin duration

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
        const newRecord = payload.new as Winner;
        const spinId = newRecord?.id;
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

        // Handle possible array return if Supabase types are wonky
        const formattedData = {
            id: data.id,
            created_at: data.created_at,
            user: Array.isArray(data.user) ? data.user[0] : data.user,
            prize: Array.isArray(data.prize) ? data.prize[0] : data.prize
        } as Winner;

        // Only add to the list if it is a valid prize (Not 'No Prize')
        if (formattedData && formattedData.prize && formattedData.prize.name !== 'No Prize') {
          setWinners(currentWinners => {
            // Prevent duplicates
            if (currentWinners.some(w => w.id === formattedData.id)) return currentWinners;
            
            // Add new winner to the top and keep list size at 8
            return [formattedData, ...currentWinners].slice(0, 8);
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
    <div className="w-full bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden flex flex-col">
      <div className="p-6 border-b border-white/10 bg-white/5">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-red-500" />
          Recent Winners
        </h3>
      </div>

      <div className="p-2 flex flex-col gap-2 max-h-[460px] overflow-hidden relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
            <p className="text-white/40 text-xs font-medium uppercase tracking-widest">Checking the records...</p>
          </div>
        ) : (
          <div className="space-y-2 overflow-y-auto pr-1 scrollbar-hide py-2">
            <AnimatePresence mode='popLayout'>
              {winners.map(winner => (
                <motion.div
                  key={winner.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-red-500/30 hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white/40 group-hover:text-red-500 transition-colors">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white truncate text-sm">
                        {winner.user?.name || 'Lucky Player'}
                      </p>
                      <p className="text-xs text-white/60 font-medium">
                        Won <span className="font-extrabold text-red-500 uppercase tracking-tight">{winner.prize?.name || 'a prize'}</span>
                      </p>
                    </div>
                    <div className="text-[10px] text-white/20 font-bold">
                       JUST NOW
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {!loading && winners.length === 0 && (
              <div className="text-center text-white/40 py-12 text-sm italic py-20 flex flex-col items-center gap-3">
                 <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white/10" />
                 </div>
                 No winners yet... be the first!
              </div>
            )}
          </div>
        )}
        
        {/* Subtle fade at the bottom if content is long */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-900/40 to-transparent pointer-events-none z-10"></div>
      </div>
      
      <div className="p-4 bg-white/5 border-t border-white/10 text-center">
         <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-none">
           Real-time updates active
         </p>
      </div>
    </div>
  );
}