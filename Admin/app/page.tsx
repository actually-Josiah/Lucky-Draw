"use client"

import { useEffect, useState, useMemo } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { StatsCard } from "@/components/stats-card"
import { UsersTable } from "@/components/users-table"
import { Users, DollarSign, TrendingUp, Search } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { User } from "@/lib/mock-data"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const USERS_PER_PAGE = 20

interface DashboardStats {
  totalRevenue: number;
  totalUsers: number;
  activeGames: number;
}

export default function DashboardPage() {
  const { isAuthenticated } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<DashboardStats>({ totalRevenue: 0, totalUsers: 0, activeGames: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("sb_admin_token")
        if (!token) throw new Error("Authentication token not found.")

        // Fetch stats and users in parallel
        const [statsRes, usersRes] = await Promise.all([
            fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } }),
            fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (!statsRes.ok) {
            const errData = await statsRes.json();
            throw new Error(errData.error || "Failed to fetch dashboard stats.");
        }
        const statsData = await statsRes.json();
        setStats(statsData);

        if (!usersRes.ok) {
          const errorData = await usersRes.json()
          throw new Error(errorData.error || "Failed to fetch users.")
        }
        const usersData: User[] = await usersRes.json()
        setUsers(usersData)

      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isAuthenticated])

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [users, searchQuery])

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE)

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * USERS_PER_PAGE
    const endIndex = startIndex + USERS_PER_PAGE
    return filteredUsers.slice(startIndex, endIndex)
  }, [filteredUsers, currentPage])

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] text-destructive">
          Error: {error}
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Admin</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard title="Total Users" value={stats.totalUsers} icon={Users} trend="" />
          <StatsCard title="Revenue" value={`GHS ${(stats.totalRevenue / 100).toFixed(2)}`} icon={DollarSign} trend="" />
          <StatsCard title="Active Games" value={stats.activeGames} icon={TrendingUp} trend="" />
        </div>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1) // Reset to first page on new search
              }}
              className="w-full max-w-sm pl-10"
            />
          </div>

          <UsersTable users={paginatedUsers} title="All Users" />

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button onClick={handlePreviousPage} disabled={currentPage === 1} className="cursor-pointer">
                Previous
              </Button>
              <Button onClick={handleNextPage} disabled={currentPage === totalPages} className="cursor-pointer">
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
