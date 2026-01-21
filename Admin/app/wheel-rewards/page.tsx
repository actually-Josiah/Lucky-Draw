'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { WheelRewardsTable } from '@/components/wheel-rewards-table'
import { AdminLayout } from '@/components/admin-layout';
import { Award, Search } from 'lucide-react'
import { useDebounce } from 'use-debounce';

// Define the type for a reward object
export interface Reward {
    id: string;
    created_at: string;
    status: 'unclaimed' | 'claimed';
    claimed_at: string | null;
    spin_code: string;
    user_id: string;
    user_name: string;
    user_phone: string;
    prize_id: string;
    prize_name: string;
}

export default function WheelRewardsPage() {
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // State for filters and pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // Debounce the search term to avoid excessive API calls while typing
    const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

    const fetchRewards = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('sb_admin_token');
            if (!token) throw new Error("Authentication token not found.");

            const params = new URLSearchParams({
                page: String(currentPage),
                status: statusFilter,
                spin_code: debouncedSearchTerm,
            });

            const response = await fetch(`/api/admin/wheel-rewards?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to fetch rewards');
            }
            
            const data = await response.json();
            setRewards(data.rewards || []);
            setTotalPages(Math.ceil((data.total || 0) / 25));

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [currentPage, statusFilter, debouncedSearchTerm]);

    // Fetch rewards when page or filters change
    useEffect(() => {
        fetchRewards();
    }, [fetchRewards]);
    
    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, debouncedSearchTerm])


    const handleClaimReward = async (rewardId: string) => {
        try {
            const token = localStorage.getItem('sb_admin_token');
            if (!token) throw new Error("Authentication token not found.");

            const response = await fetch(`/api/admin/wheel-rewards/${rewardId}/claim`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) {
                throw new Error('Failed to claim reward');
            }
            // Re-fetch rewards on the current page to show the updated status
            fetchRewards();
        } catch (err) {
            console.error("Failed to claim reward:", err);
            // Here you could show a toast notification to the user
        }
    };

    return (
        <AdminLayout>
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-between mb-6">
                    <div className='flex items-center gap-2'>
                        <Award className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-bold">Wheel Game Rewards</h1>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search by code, user, prize..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                        <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="unclaimed">Unclaimed</TabsTrigger>
                            <TabsTrigger value="claimed">Claimed</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {loading && <p>Loading rewards...</p>}
                {error && <p className="text-red-500">Error: {error}</p>}
                {!loading && !error && (
                    <>
                        <WheelRewardsTable rewards={rewards} onClaimReward={handleClaimReward} />
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-sm text-muted-foreground">
                                Page {currentPage} of {totalPages > 0 ? totalPages : 1}
                            </p>
                            <div className="flex gap-2">
                                <Button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
                                    Previous
                                </Button>
                                <Button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages}>
                                    Next
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    );
}
