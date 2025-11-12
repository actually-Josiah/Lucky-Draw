// app/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import LoginForm from "@/components/login-form"
import OtpModal from "@/components/otp-modal"
import Header from "@/components/header"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [showOtpModal, setShowOtpModal] = useState(false)
  const router = useRouter()

  const handleEmailSubmit = (email: string) => {
    setEmail(email)
    setShowOtpModal(true)
  }

  const handleOtpVerify = () => {
    // We don't need the OTP value here, just the signal that verification passed
    router.push("/home") 
    setShowOtpModal(false)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[url('/bg-wheel.png')] bg-cover bg-center bg-no-repeat flex items-center justify-center p-4 pt-24">
        <LoginForm onSubmit={handleEmailSubmit} />
        {showOtpModal && (
          <OtpModal
            email={email}
            onVerify={handleOtpVerify}
            onClose={() => setShowOtpModal(false)}
          />
        )}
      </main>
    </>
  )
}