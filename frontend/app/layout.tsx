import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import { Toaster } from "@/components/ui/sonner" // 👈 import Toaster here
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Wo Sura A Wo Nni | Foodstuff Home',
    icons: {
    icon: '/logo.png',                 // Chrome / Opera / Firefox
    apple: '/logo.png',                // Safari iOS + macOS
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
