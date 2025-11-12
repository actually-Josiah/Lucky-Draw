// components/otp-modal.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// We still need the Supabase client for the client-side resend button if we choose to use it, 
// but we'll use our API endpoint for consistency.

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface VerifyResponse {
    message: string;
    user: { id: string; email: string };
    session: { access_token: string };
    error?: string; // For handling API error response structure
}

interface OtpModalProps {
  email: string
  onVerify: () => void // Removed OTP argument since we don't need it after success
  onClose: () => void
}

function maskEmail(email: string) {
  const [user, domain] = email.split("@")
  const maskedUser = user.slice(0, 3) + "*".repeat(Math.max(0, user.length - 3))
  return `${maskedUser}@${domain}`
}

export default function OtpModal({ email, onVerify, onClose }: OtpModalProps) {
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [timeLeft, setTimeLeft] = useState(240)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleResend = async () => {
    // Re-use API call for resending code
    await fetch(`${API_URL}/api/register-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setTimeLeft(60)
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (otp.length !== 6) {
      setError("Please enter a 6-digit code")
      return
    }

    setLoading(true)
    
    // Call the Express API to verify OTP (where profile creation happens)
    try {
      const response = await fetch(`${API_URL}/api/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, token: otp }),
      })
      
      const data: VerifyResponse = await response.json()
      
      if (!response.ok) {
        setError(data.error || "Invalid code. Please try again.")
      } else {
        // Success! Store the token
        localStorage.setItem("supabase.access_token", data.session.access_token)
        onVerify() // Redirects to /play
      }

    } catch (err) {
      setError("Network error. Failed to verify code.")
      console.error(err)
    }

    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 animate-in fade-in zoom-in-95">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Verify Your Email</h2>
          <p className="text-slate-600">
            We sent a code to <span className="font-semibold">{maskEmail(email)}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-slate-700 font-medium">
              Verification Code
            </Label>
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              disabled={loading}
              className="text-center text-2xl tracking-widest py-6 border-slate-300 focus:border-slate-900 font-mono"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>

          <Button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-red-500 hover:bg-red-400 text-white py-6 text-base font-semibold disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </Button>
        </form>

        <div className="mt-6 space-y-3">
          <button
            onClick={onClose}
            className="w-full text-slate-600 hover:text-slate-900 font-medium py-2 transition-colors"
          >
            Use Different Email
          </button>

          {timeLeft > 0 ? (
            <p className="text-center text-slate-500 text-sm">
              Resend code in <span className="font-semibold">{timeLeft}s</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              className="w-full text-slate-900 hover:text-slate-700 font-medium py-2 transition-colors"
            >
              Resend Code
            </button>
          )}
        </div>
      </div>
    </div>
  )
}