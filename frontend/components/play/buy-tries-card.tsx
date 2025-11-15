"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DollarSign, Loader2 } from "lucide-react"

// --- Define props from parent (Home Page or Dashboard) ---
interface BuyTriesCardProps {
  userId: string
  userEmail: string // Needed for Paystack initialization
  onPurchaseSuccess: () => void // Refresh UI when tokens update
}

// --- Get Paystack key from .env ---
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY

// --- Define packages available ---
const purchasePackages = [
  { amount: 20, tokens: 1, label: "1 Token" },
  { amount: 50, tokens: 3, label: "3 Tokens (Best Value)" },
  { amount: 90, tokens: 5, label: "5 Tokens" },
  // { amount: 130, tokens: 7, label: "7 Tokens" },
  { amount: 190, tokens: 10, label: "10 Tokens" },
  // { amount: 290, tokens: 15, label: "15 Tokens" },
  // { amount: 390, tokens: 20, label: "20 Tokens" },
]

// --- Paystack type for TypeScript ---
declare const PaystackPop: any

export default function BuyTriesCard({
  userId,
  userEmail,
  onPurchaseSuccess,
}: BuyTriesCardProps) {
  const [loadingPackage, setLoadingPackage] = useState<number | null>(null)

  // Debug check for environment variables
  useEffect(() => {
    console.log("✅ Paystack Public Key:", PAYSTACK_PUBLIC_KEY)
    console.log("✅ User ID:", userId)
    console.log("✅ User Email:", userEmail)
    if (typeof window !== "undefined") {
      console.log("✅ PaystackPop loaded?", typeof (window as any).PaystackPop !== "undefined")
    }
  }, [userId, userEmail])

  const handlePurchase = (pkg: typeof purchasePackages[0]) => {
    setLoadingPackage(pkg.tokens)

    // --- Safety Check: Ensure SDK is loaded ---
    if (typeof PaystackPop === "undefined") {
      alert("⚠️ Paystack SDK not loaded. Please ensure script is included in layout.tsx.")
      console.error("❌ PaystackPop is undefined. Inline script may not have loaded.")
      setLoadingPackage(null)
      return
    }

    console.log("💳 Initializing Paystack for:", {
      key: PAYSTACK_PUBLIC_KEY,
      email: userEmail,
      amount: pkg.amount * 100,
      tokens: pkg.tokens,
      userId,
    })

    try {
      const handler = PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: userEmail,
        amount: pkg.amount * 100,
        currency: "GHS",
        ref: `REF_${userId}_${pkg.tokens}_${Date.now()}`, // Unique payment reference
        metadata: {
          user_id: userId,
          tokens_to_add: pkg.tokens,
        },
        callback: (response: { reference: string }) => {
          console.log("✅ Payment Success! Reference:", response.reference)
          onPurchaseSuccess()
          setLoadingPackage(null)
        },
        onClose: () => {
          console.warn("❌ Payment closed by user.")
          setLoadingPackage(null)
        },
      })

      // --- Open the inline Paystack modal ---
      handler.openIframe()
      console.log("🧾 Paystack payment window opened successfully.")
    } catch (error) {
      console.error("❌ Paystack Setup Error:", error)
      alert("Failed to start payment. Check console for details.")
      setLoadingPackage(null)
    }
  }

  return (
    <Card className="p-6 shadow-xl bg-white">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-slate-900">Get Game Tries</h2>
        <DollarSign className="h-6 w-6 text-red-500" />
      </div>

      <div className="space-y-4">
        {purchasePackages.map((pkg) => (
          <div
            key={pkg.tokens}
            className="flex justify-between items-center border p-4 rounded-lg bg-gray-50 hover:border-red-600 transition-colors"
          >
            <div>
              <p className="font-bold text-lg text-slate-900">{pkg.label}</p>
              <p className="text-sm text-slate-600">GHS {pkg.amount.toLocaleString()}</p>
            </div>

            {/* ✅ Wrapped button in a form to satisfy Paystack inline script */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handlePurchase(pkg)
              }}
            >
              <Button
                type="submit"
                disabled={loadingPackage !== null}
                className="bg-red-500 hover:bg-red-400 font-bold min-w-[120px] cursor-pointer"
              >
                {loadingPackage === pkg.tokens ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Buy Now"
                )}
              </Button>
            </form>
          </div>
        ))}
      </div>

      <p className="text-xs text-center text-slate-500 mt-6">
        Powered by Paystack. Your balance will update instantly after payment.
      </p>
    </Card>
  )
}
