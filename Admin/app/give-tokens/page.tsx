"use client"

import { useState, useEffect, useMemo } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Gift, CheckCircle, Loader2, AlertTriangle, User as UserIcon, Search } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Re-using User interface from dashboard page
interface User {
  id: string
  name: string
  email: string
  phone_number: string
  tokens: number
  joinedAt: string
}

export default function GiveTokensPage() {
  const [selectedUserId, setSelectedUserId] = useState("")
  const [tokenAmount, setTokenAmount] = useState<string>("") // Keep as string for input
  
  const [givingTokens, setGivingTokens] = useState(false)
  const [giveTokensError, setGiveTokensError] = useState<string | null>(null)
  const [giveTokensSuccess, setGiveTokensSuccess] = useState<string | null>(null)

  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [errorUsers, setErrorUsers] = useState<string | null>(null)

  const [openUserSelect, setOpenUserSelect] = useState(false) // State for the searchable select popover

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("sb_admin_token")
        if (!token) throw new Error("Authentication token not found.")

        const res = await fetch("/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || "Failed to fetch users.")
        }
        const data: User[] = await res.json()
        setUsers(data)
      } catch (err: any) {
        setErrorUsers(err.message)
        console.error("Error fetching users:", err)
      } finally {
        setLoadingUsers(false)
      }
    }
    fetchUsers()
  }, [])

  const selectedUser = useMemo(() => {
    return users.find((u) => u.id === selectedUserId)
  }, [users, selectedUserId])

  const handleGiveTokens = async () => {
    setGivingTokens(true)
    setGiveTokensError(null)
    setGiveTokensSuccess(null)

    const amount = parseInt(tokenAmount, 10)
    if (!selectedUserId || isNaN(amount) || amount <= 0) {
      setGiveTokensError("Please select a user and enter a valid positive number of tokens.")
      setGivingTokens(false)
      return
    }

    try {
      const token = localStorage.getItem("sb_admin_token")
      if (!token) throw new Error("Authentication token not found.")

      const res = await fetch("/api/admin/give-tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: selectedUserId,
          tokenAmount: amount,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to give tokens.")
      }
      
      setGiveTokensSuccess(`Successfully gave ${amount} tokens to ${selectedUser?.name || selectedUserId}.`)
      setSelectedUserId("")
      setTokenAmount("")
      
      // Optionally refetch users to update their displayed token balances
      // For simplicity, we'll just clear form. A full re-fetch of all users might be heavy.
      // If we had a mechanism to update individual user's token balance in 'users' state, we'd do that.

    } catch (err: any) {
      setGiveTokensError(err.message)
    } finally {
      setGivingTokens(false)
    }
  }

  const renderContent = () => {
    if (loadingUsers) {
      return (
        <div className="flex justify-center items-center p-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    }

    if (errorUsers) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorUsers}</AlertDescription>
        </Alert>
      )
    }

    if (users.length === 0) {
      return (
        <Card className="max-w-xl border-border bg-card text-center p-10">
          <UserIcon className="h-12 w-12 mx-auto text-muted-foreground" />
          <CardTitle className="mt-4">No Users Found</CardTitle>
          <p className="text-muted-foreground mt-2">There are no users to give tokens to.</p>
        </Card>
      )
    }

    return (
      <Card className="max-w-xl border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">Token Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {giveTokensError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{giveTokensError}</AlertDescription>
            </Alert>
          )}
          {giveTokensSuccess && (
            <Alert variant="default" className="bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{giveTokensSuccess}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="user" className="text-card-foreground">
              Select User
            </Label>
            <Popover open={openUserSelect} onOpenChange={setOpenUserSelect}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openUserSelect}
                        className="w-full justify-between border-border bg-input text-foreground"
                    >
                        {selectedUser ? `${selectedUser.name} (${selectedUser.email})` : "Select user..."}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-border bg-popover">
                    <Command>
                        <CommandInput placeholder="Search user by name, email or phone..." className="h-9" />
                        <CommandList>
                            <CommandEmpty>No user found.</CommandEmpty>
                            <CommandGroup>
                                {users.filter(user => 
                                    (user.name && user.name.toLowerCase().includes(CommandInput.value?.toLowerCase() || '')) ||
                                    (user.email && user.email.toLowerCase().includes(CommandInput.value?.toLowerCase() || '')) ||
                                    (user.phone_number && user.phone_number.toLowerCase().includes(CommandInput.value?.toLowerCase() || ''))
                                ).map((user) => (
                                    <CommandItem
                                        key={user.id}
                                        value={`${user.name || ''} ${user.email || ''} ${user.phone_number || ''}`} // Value to search against
                                        onSelect={(currentValue) => {
                                            setSelectedUserId(user.id === selectedUserId ? "" : user.id)
                                            setOpenUserSelect(false)
                                        }}
                                    >
                                        <div className="flex flex-col">
                                            <span>{user.name || 'N/A'}</span>
                                            <span className="text-xs text-muted-foreground">{user.email || 'N/A'}</span>
                                            <span className="text-xs text-muted-foreground">{user.phone_number || 'N/A'}</span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
          </div>

          {selectedUser && (
            <div className="rounded-lg bg-secondary/50 p-3">
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className="text-xl font-bold text-primary">{selectedUser.tokens} tokens</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="tokens" className="text-card-foreground">
              Number of Tokens
            </Label>
            <Input
              id="tokens"
              type="number"
              placeholder="Enter token amount"
              value={tokenAmount}
              onChange={(e) => setTokenAmount(e.target.value)}
              className="border-border bg-input text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <Button
            onClick={handleGiveTokens}
            disabled={!selectedUserId || !tokenAmount || givingTokens}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {givingTokens ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Gift className="mr-2 h-4 w-4" />
                Give Tokens
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Give Tokens</h1>
          <p className="text-muted-foreground">Award tokens to users</p>
        </div>
        {renderContent()}
      </div>
    </AdminLayout>
  )
}