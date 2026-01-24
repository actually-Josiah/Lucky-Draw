"use client"

import { useState, useEffect, useCallback } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Download, Loader2, AlertTriangle, Users, FileSpreadsheet } from "lucide-react"

interface User {
  id: string
  email: string
  name: string
  phone_number: string
  tokens: number
  joinedAt: string
  total_wins: number
}

const OPTIONAL_FIELDS = [
  { key: "email", label: "Email" },
  { key: "phone_number", label: "Phone Number" },
  { key: "tokens", label: "Tokens" },
  { key: "joinedAt", label: "Joined Date" },
  { key: "total_wins", label: "Total Wins" },
] as const

type FieldKey = typeof OPTIONAL_FIELDS[number]["key"]

const TOKEN_FILTERS = [
  { value: "all", label: "All Users" },
  { value: "0", label: "0 Tokens" },
  { value: "1", label: "1+ Tokens" },
  { value: "5", label: "5+ Tokens" },
  { value: "10", label: "10+ Tokens" },
  { value: "50", label: "50+ Tokens" },
]

export default function ExportUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  // Field selection - name is always included
  const [selectedFields, setSelectedFields] = useState<Set<FieldKey>>(
    new Set(["email", "phone_number", "tokens"])
  )
  
  // Token filter
  const [tokenFilter, setTokenFilter] = useState("all")

  const fetchUsers = useCallback(async () => {
    setError(null)
    setLoading(true)
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
      setError(err.message)
      console.error("Error fetching users:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const toggleField = (field: FieldKey) => {
    setSelectedFields(prev => {
      const next = new Set(prev)
      if (next.has(field)) {
        next.delete(field)
      } else {
        next.add(field)
      }
      return next
    })
  }

  // Apply token filter
  const filteredUsers = users.filter(user => {
    if (tokenFilter === "all") return true
    const minTokens = parseInt(tokenFilter, 10)
    if (tokenFilter === "0") return user.tokens === 0
    return user.tokens >= minTokens
  })

  // Generate CSV and trigger download
  const exportToCSV = () => {
    setExporting(true)
    
    try {
      // Build header row - name is always first
      const headers = ["Name"]
      const fieldKeys: (FieldKey | "name")[] = ["name" as any]
      
      OPTIONAL_FIELDS.forEach(field => {
        if (selectedFields.has(field.key)) {
          headers.push(field.label)
          fieldKeys.push(field.key)
        }
      })

      // Build data rows
      const rows = filteredUsers.map(user => {
        return fieldKeys.map(key => {
          if (key === "name") return user.name
          if (key === "joinedAt") {
            return new Date(user.joinedAt).toLocaleDateString()
          }
          const value = user[key as keyof User]
          // Escape quotes and wrap in quotes if contains comma
          const stringValue = String(value ?? "")
          if (stringValue.includes(",") || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`
          }
          return stringValue
        })
      })

      // Combine into CSV string
      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n")

      // Create blob and trigger download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `users_export_${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Error exporting CSV:", err)
    } finally {
      setExporting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Export Users</h1>
          <p className="text-muted-foreground">Export user data to a CSV file</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Settings Panel */}
          <Card className="border-border bg-card lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                Export Settings
              </CardTitle>
              <CardDescription>Choose which fields to include</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Field Selection */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Fields to Export</Label>
                
                {/* Name - always selected */}
                <div className="flex items-center space-x-2 opacity-60">
                  <Checkbox id="field-name" checked disabled />
                  <Label htmlFor="field-name" className="text-sm">Name (required)</Label>
                </div>
                
                {/* Optional fields */}
                {OPTIONAL_FIELDS.map(field => (
                  <div key={field.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`field-${field.key}`}
                      checked={selectedFields.has(field.key)}
                      onCheckedChange={() => toggleField(field.key)}
                    />
                    <Label htmlFor={`field-${field.key}`} className="text-sm cursor-pointer">
                      {field.label}
                    </Label>
                  </div>
                ))}
              </div>

              {/* Token Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Filter by Tokens</Label>
                <Select value={tokenFilter} onValueChange={setTokenFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select filter" />
                  </SelectTrigger>
                  <SelectContent>
                    {TOKEN_FILTERS.map(filter => (
                      <SelectItem key={filter.value} value={filter.value}>
                        {filter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Export Button */}
              <Button
                onClick={exportToCSV}
                disabled={loading || exporting || filteredUsers.length === 0}
                className="w-full"
              >
                {exporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Export {filteredUsers.length} Users
              </Button>
            </CardContent>
          </Card>

          {/* Preview Panel */}
          <Card className="border-border bg-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Preview
              </CardTitle>
              <CardDescription>
                Showing {Math.min(10, filteredUsers.length)} of {filteredUsers.length} users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center p-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <p className="text-center text-muted-foreground py-10">
                  No users match the current filter.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="text-muted-foreground">Name</TableHead>
                        {selectedFields.has("email") && (
                          <TableHead className="text-muted-foreground">Email</TableHead>
                        )}
                        {selectedFields.has("phone_number") && (
                          <TableHead className="text-muted-foreground">Phone</TableHead>
                        )}
                        {selectedFields.has("tokens") && (
                          <TableHead className="text-muted-foreground">Tokens</TableHead>
                        )}
                        {selectedFields.has("joinedAt") && (
                          <TableHead className="text-muted-foreground">Joined</TableHead>
                        )}
                        {selectedFields.has("total_wins") && (
                          <TableHead className="text-muted-foreground">Wins</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.slice(0, 10).map(user => (
                        <TableRow key={user.id} className="border-border">
                          <TableCell className="font-medium">{user.name}</TableCell>
                          {selectedFields.has("email") && (
                            <TableCell>{user.email}</TableCell>
                          )}
                          {selectedFields.has("phone_number") && (
                            <TableCell>{user.phone_number}</TableCell>
                          )}
                          {selectedFields.has("tokens") && (
                            <TableCell>{user.tokens}</TableCell>
                          )}
                          {selectedFields.has("joinedAt") && (
                            <TableCell>{new Date(user.joinedAt).toLocaleDateString()}</TableCell>
                          )}
                          {selectedFields.has("total_wins") && (
                            <TableCell>{user.total_wins}</TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
