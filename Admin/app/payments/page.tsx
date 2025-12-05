"use client"

import { useState, useEffect, useMemo } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertTriangle, Search } from "lucide-react"

// Interface to match backend data
interface Payment {
  id: string;
  created_at: string;
  user_id: string;
  amount: number; // In pesewas
  paystack_reference: string;
  status: string;
  tokens_purchased: number;
  user_name: string;
}

const PAYMENTS_PER_PAGE = 20;

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("sb_admin_token")
        if (!token) throw new Error("Authentication required.")
        
        const res = await fetch("/api/admin/payments", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
            const errData = await res.json()
            throw new Error(errData.error || "Failed to fetch payments.")
        }
        const data: Payment[] = await res.json()
        setPayments(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchPayments()
  }, [])

  // Memoized calculations for stats, search, and pagination
  const { totalRevenue, totalTokens, filteredPayments } = useMemo(() => {
    const revenue = payments.reduce((sum, p) => sum + p.amount, 0) / 100
    const tokens = payments.reduce((sum, p) => sum + p.tokens_purchased, 0)
    
    const filtered = payments.filter(p => 
        p.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.paystack_reference.toLowerCase().includes(searchQuery.toLowerCase())
    )
    
    return { totalRevenue: revenue, totalTokens: tokens, filteredPayments: filtered }
  }, [payments, searchQuery])

  const totalPages = Math.ceil(filteredPayments.length / PAYMENTS_PER_PAGE)
  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * PAYMENTS_PER_PAGE
    return filteredPayments.slice(startIndex, startIndex + PAYMENTS_PER_PAGE)
  }, [filteredPayments, currentPage])


  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center p-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )
    }

    return (
      <>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-3xl font-bold text-primary">GHS {totalRevenue.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Total Tokens Sold</p>
              <p className="text-3xl font-bold text-accent">{totalTokens.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-card-foreground">Payment History</CardTitle>
              <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                      type="text"
                      placeholder="Search by name or reference..."
                      value={searchQuery}
                      onChange={(e) => {
                          setSearchQuery(e.target.value)
                          setCurrentPage(1)
                      }}
                      className="w-full sm:w-64 pl-10"
                  />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">User</TableHead>
                  <TableHead className="text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-muted-foreground">Tokens</TableHead>
                  <TableHead className="text-muted-foreground">Paystack Reference</TableHead>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPayments.map((payment) => (
                  <TableRow key={payment.id} className="border-border hover:bg-secondary/50">
                    <TableCell className="font-medium text-card-foreground">{payment.user_name}</TableCell>
                    <TableCell>
                      <Badge className="bg-primary/10 text-primary">GHS {(payment.amount / 100).toFixed(2)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-accent/10 text-accent">
                        {payment.tokens_purchased}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{payment.paystack_reference}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(payment.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                    <Button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Previous</Button>
                    <Button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Next</Button>
                </div>
            </div>
          </CardContent>
        </Card>
      </>
    )
  }


  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground">Track user payments and token purchases</p>
        </div>
        {renderContent()}
      </div>
    </AdminLayout>
  )
}
