"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image" // Import Image component
import { Ticket, Mail, KeyRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { useAuth } from "@/context/AuthContext"

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")

    // Use the login function from the AuthContext
    const { login } = useAuth()

    // 'email' or 'otp'
    const [stage, setStage] = useState<'email' | 'otp'>('email')

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const res = await fetch("/api/register-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, is_admin_login: true }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "An unexpected error occurred.")
            }

            setStage('otp')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const res = await fetch("/api/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, token: otp }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Invalid OTP or an error occurred.")
            }
            
            // In a real app, you would store the session token securely
            if (data.session && data.session.access_token) {
                localStorage.setItem("sb_admin_token", data.session.access_token)
                login() // Call login from AuthContext
            }

            router.push("/")
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 p-4">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
            </div>

            <Card className="w-full max-w-md relative z-10 shadow-xl border-primary/20">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-gray-300 rounded-2xl flex items-center justify-center shadow-lg">
                        <Image src="/logo.png" alt="Logo" width={32} height={32} className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
                        <CardDescription className="mt-2">
                            {stage === 'email' ? 'Sign in with your administrator email' : 'Check your email for a one-time code'}
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {stage === 'email' ? (
                        <form onSubmit={handleEmailSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-11 pl-10"
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full h-11 font-semibold" disabled={isLoading}>
                                {isLoading ? "Sending..." : "Send One-Time Code"}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleOtpSubmit} className="space-y-6">
                             <div className="space-y-2">
                                <Label htmlFor="otp">One-Time Code</Label>
                                <div className="relative flex justify-center">
                                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                                        <InputOTPGroup>
                                            <InputOTPSlot index={0} />
                                            <InputOTPSlot index={1} />
                                            <InputOTPSlot index={2} />
                                        </InputOTPGroup>
                                        <InputOTPGroup>
                                            <InputOTPSlot index={3} />
                                            <InputOTPSlot index={4} />
                                            <InputOTPSlot index={5} />
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>
                                <p className="text-center text-sm text-muted-foreground">
                                    Entered email: <strong>{email}</strong>
                                </p>
                            </div>
                            <Button type="submit" className="w-full h-11 font-semibold" disabled={isLoading}>
                                {isLoading ? "Verifying..." : "Sign In"}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}