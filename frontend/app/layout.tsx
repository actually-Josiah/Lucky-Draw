import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import { Toaster } from "@/components/ui/sonner" // 👈 import Toaster here
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Wo Sura A Wo Nni | Win Big with Foodstuff Home Lucky Draw',
  description: 'Try your luck with Ghana\'s favorite pick and win game! Play the Lucky Grid, spin the Wheel of Fortune, and win amazing prizes including foodstuff, cash, and sponsor rewards. Licensed and secure lottery-style gaming.',
  keywords: ['lottery', 'pick and win', 'lucky draw', 'NLA Ghana', 'bet', 'spin the wheel', 'foodstuff home', 'Ghana games'],
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}

        {/* 👇 Toast provider available app-wide */}
        <Toaster richColors position="top-center" />

        <Analytics />
        <Script 
          src="https://js.paystack.co/v1/inline.js" 
          strategy="beforeInteractive"
        />
      </body>
    </html>
  )
}
