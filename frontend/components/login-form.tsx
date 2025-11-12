// components/login-form.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface LoginFormProps {
  onSubmit: (email: string) => void
}

export default function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    setLoading(true)
    
    // Call the Express API to send OTP
    try {
      const response = await fetch(`${API_URL}/api/register-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || "Failed to send OTP. Please try again.")
      } else {
        setSuccess("We’ve sent a 6-digit code via email.")
        onSubmit(email) 
      }

    } catch (err) {
      setError("Network error. Could not connect to the API server.")
      console.error(err)
    }

    setLoading(false)
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <div className="p-8"> 
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome</h1>
          <p className="text-slate-600">Sign in or Register with your email for an OTP code</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700 font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="text-lg py-6 border-slate-300 focus:border-slate-900"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-400 text-white py-6 text-base font-semibold cursor-pointer"
          >
            {loading ? "Sending Code..." : "Send Code"}
          </Button>
        </form>

        <p className="text-center text-slate-600 text-sm mt-6">
          We’ll send a verification code to your email
        </p>
      </div>
    </Card>
  )
}