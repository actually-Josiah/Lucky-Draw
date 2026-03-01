// app/page.tsx
"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ShoppingBag, Gift, ArrowRight, Star, ShieldCheck, Zap } from "lucide-react"

import LoginForm from "@/components/login-form"
import OtpModal from "@/components/otp-modal"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  const [email, setEmail] = useState("")
  const [showOtpModal, setShowOtpModal] = useState(false)
  const router = useRouter()
  const loginRef = useRef<HTMLDivElement>(null)

  const handleEmailSubmit = (email: string) => {
    setEmail(email)
    setShowOtpModal(true)
  }

  const handleOtpVerify = () => {
    // We don't need the OTP value here, just the signal that verification passed
    router.push("/home") 
    setShowOtpModal(false)
  }

  const scrollToLogin = () => {
    loginRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-red-500 selection:text-white overflow-x-hidden">
      <Header />

      <main>
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          {/* Background image & gradient overlay */}
          <div className="absolute inset-0 z-0">
            <Image 
              src="/login2.jpg" 
              alt="Excited user in market" 
              fill 
              sizes="100vw"
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/40"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-100 border border-red-500/30 mb-6 backdrop-blur-md">
                <Gift size={16} />
                <span className="text-sm font-medium tracking-wide text-white">Daily Winners Announced!</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6 drop-shadow-lg">
                Win Big with <span className="text-red-500">Foodstuff Home</span> Wo Sura A Wo Nni
              </h1>
              
              <p className="text-lg md:text-xl text-slate-200 mb-10 max-w-xl leading-relaxed drop-shadow-md">
                Play the Lucky Grid or spin the Wheel of Fortune. Win instant groceries, cash prizes, and sponsors' rewards directly from your phone.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                 <Button 
                    onClick={scrollToLogin}
                    size="lg"
                    className="bg-red-600 hover:bg-red-500 text-white border-0 text-lg px-8 py-6 h-auto font-semibold shadow-[0_0_40px_-10px_rgba(220,38,38,0.5)] transition-all hover:scale-105"
                  >
                    Start Playing Now
                    <ArrowRight className="ml-2" size={20} />
                  </Button>
                  <Button 
                    onClick={() => {
                      document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    variant="outline"
                    size="lg"
                    className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-md text-lg px-8 py-6 h-auto font-medium"
                  >
                    How it Works
                  </Button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 flex items-center gap-6 text-slate-300 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-green-400" />
                  <span>Secure Payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap size={20} className="text-yellow-400" />
                  <span>Instant Rewards</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-red-500 font-bold tracking-wider uppercase text-sm mb-3">Simple Process</h2>
              <h3 className="text-4xl font-bold text-slate-900 mb-4">How to Win Your Groceries</h3>
              <p className="text-lg text-slate-600">You are just three simple steps away from joining our daily winners. It's fast, transparent, and exciting!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
               {/* Connecting Line (Desktop only) */}
               <div className="hidden md:block absolute top-[45px] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-red-100 via-red-500/50 to-red-100 z-0"></div>

              {/* Step 1 */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-slate-50 border-4 border-white shadow-xl rounded-full flex items-center justify-center mb-6 text-red-500 text-3xl font-black">
                  1
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">Register via Email</h4>
                <p className="text-slate-600 leading-relaxed">Simply enter your email address to receive an instant OTP. No long forms, no passwords to remember.</p>
              </div>

              {/* Step 2 */}
               <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-red-500 shadow-xl shadow-red-500/30 border-4 border-white rounded-full flex items-center justify-center mb-6 text-white text-3xl font-black">
                  2
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">Get Tries (Pay)</h4>
                <p className="text-slate-600 leading-relaxed">Securely purchase game tokens via Paystack. Your tokens are instantly added to your dashboard.</p>
              </div>

              {/* Step 3 */}
               <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-slate-50 border-4 border-white shadow-xl rounded-full flex items-center justify-center mb-6 text-red-500 text-3xl font-black">
                  3
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">Play & Win</h4>
                <p className="text-slate-600 leading-relaxed">Pick your lucky numbers on the Grid or spin the Wheel of Fortune. Win incredible rewards instantly!</p>
              </div>
            </div>
          </div>
        </section>

        {/* PRIZES SECTION */}
        <section className="py-24 bg-slate-50 border-y border-slate-200">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-red-500 font-bold tracking-wider uppercase text-sm mb-3">Incredible Rewards</h2>
                <h3 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">What's in the Basket?</h3>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  We've partnered with top brands to bring you rewards that matter. From essential foodstuff packs to sponsored items and cash prizes, every spin holds potential!
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <div className="mt-1 bg-green-100 p-1.5 rounded-full text-green-600"><ShoppingBag size={16} /></div>
                    <div>
                      <strong className="block text-slate-900">Jumbo Grocery Packs</strong>
                      <span className="text-slate-600 text-sm">Rice, Oil, Provisions and more lasting your family for weeks.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 bg-amber-100 p-1.5 rounded-full text-amber-600"><Gift size={16} /></div>
                    <div>
                      <strong className="block text-slate-900">Sponsor Goodies</strong>
                      <span className="text-slate-600 text-sm">Exclusive merch and vouchers from our partners like Yango.</span>
                    </div>
                  </li>
                </ul>
                <Button onClick={scrollToLogin} className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-8">
                  Get Started
                </Button>
              </div>
              <div className="relative">
                {/* Decorative Elements */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-red-100 to-amber-50 rounded-[2rem] transform rotate-3 -z-10"></div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                     <div className="h-48 rounded-2xl bg-[url('/maincaro1.jpeg')] bg-cover bg-center shadow-md"></div>
                     <div className="h-64 rounded-2xl bg-[url('/win.jpeg')] bg-cover bg-center shadow-md"></div>
                  </div>
                  <div className="space-y-4 pt-8">
                     <div className="h-64 rounded-2xl bg-[url('/maincaro2.jpeg')] bg-cover bg-center shadow-md"></div>
                     <div className="h-48 rounded-2xl bg-[url('/play1.png')] bg-cover bg-center shadow-md p-4 bg-white/50 backdrop-blur-sm flex items-center justify-center">
                       <Image src="/yango.png" alt="Yango Sponsor" width={120} height={120} className="object-contain drop-shadow-lg" />
                     </div>
                  </div>
                </div>
              </div>
            </div>
           </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-24 bg-slate-900 text-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
               <h2 className="text-red-400 font-bold tracking-wider uppercase text-sm mb-3">Wall of Fame</h2>
               <h3 className="text-4xl font-bold mb-4">Hear from our Winners</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: "Amina Y.", text: "At first I thought it was another scam, but I actually won a bag of rice and oil on my second try! My family is sorted for the month.", role: "Won Jumbo Pack" },
                { name: "Kwame P.", text: "The Paystack integration makes buying tokens so smooth. I spun the wheel yesterday and got 50 GHS instantly sent to my Momo.", role: "Won Cash Prize" },
                { name: "Grace O.", text: "Bless the team behind FoodStuff Home. Entering with just an email is so easy, and winning the Yango ride voucher saved my weekend.", role: "Won Yango Voucher" }
              ].map((testimonial, i) => (
                <div key={i} className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 backdrop-blur-sm relative">
                  <div className="flex gap-1 mb-4 text-yellow-400">
                    {[1, 2, 3, 4, 5].map(star => <Star key={star} size={16} fill="currentColor" />)}
                  </div>
                  <p className="text-slate-300 mb-6 italic">"{testimonial.text}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-red-400">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{testimonial.name}</h4>
                      <p className="text-sm text-slate-400">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LOGIN / CTA SECTION */}
        <section ref={loginRef} className="py-32 bg-white relative overflow-hidden">
           {/* Background Decoration */}
           <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50/50 skew-x-12 origin-top"></div>
           <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
           <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="max-w-xl">
                 <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">Ready to Try Your Luck?</h2>
                 <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                   Enter your email to receive a secure, one-time password. Log in, grab some tokens via Paystack, and start winning today!
                 </p>
                 <div className="flex items-center gap-4 text-slate-500 font-medium mt-6">
                   <div className="flex -space-x-4">
                     {[
                       { initial: 'A', bg: 'bg-red-500', z: 'z-40' },
                       { initial: 'K', bg: 'bg-red-400', z: 'z-30' },
                       { initial: 'G', bg: 'bg-red-300', z: 'z-20' },
                       { initial: 'M', bg: 'bg-red-200', z: 'z-10' }
                     ].map((user, i) => (
                       <div key={i} className={`w-12 h-12 rounded-full border-4 border-white ${user.bg} text-white flex items-center justify-center font-bold text-lg shadow-sm ${user.z}`}>
                         {user.initial}
                       </div>
                     ))}
                   </div>
                   <p>Join <span className="text-slate-900 font-bold">1,000+</span> daily players</p>
                 </div>
              </div>
              
              <div className="flex justify-center lg:justify-end">
                {/* Embedded Login Form with enhanced shadow */}
                <div className="relative w-full max-w-md group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-red-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative bg-white rounded-xl shadow-2xl">
                    <LoginForm onSubmit={handleEmailSubmit} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl text-white">FoodStuff Home</span>
          </div>
          <p>© {new Date().getFullYear()} FoodStuff Home. All rights reserved.</p>
          <div className="flex gap-4 text-sm hover:[&>a]:text-white">
            <a href="#">Terms & Conditions</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Contact Support</a>
          </div>
        </div>
      </footer>

      {showOtpModal && (
        <OtpModal
          email={email}
          onVerify={handleOtpVerify}
          onClose={() => setShowOtpModal(false)}
        />
      )}
    </div>
  )
}