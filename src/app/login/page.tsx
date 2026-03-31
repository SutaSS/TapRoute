'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="relative min-h-[100dvh] flex items-center justify-center selection:bg-greenDark selection:text-white py-6 sm:py-8 px-4 sm:px-6">
      
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0 bg-gray-900">
        <Image src="/images/pantai.png" alt="Travel Landscape bg" fill className="object-cover opacity-80" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A2F4D]/85 via-[#0B3D63]/45 to-[#061b2d]/70" />
        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[#061b2d]/90 via-[#0A2F4D]/45 to-transparent backdrop-blur-[3px]" />
        <div className="absolute inset-0 bg-black/15" />
      </div>

      {/* Center Glass Form Section */}
      <div className="relative z-10 w-full max-w-md flex flex-col p-6 sm:p-12 justify-center bg-white/15 backdrop-blur-xl border border-white/30 rounded-[2.5rem] shadow-[0_12px_50px_rgba(0,0,0,0.35)] animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        <Link href="/" className="flex flex-col items-center justify-center gap-4 mb-8 w-full hover:opacity-80 transition-opacity">
          <div className="bg-white/20 backdrop-blur-md p-4 rounded-3xl border border-white/35 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
            <Image src="/images/logo-2.png" alt="TapRoute Logo" width={120} height={120} className="rounded-2xl object-cover" />
          </div>
        </Link>
        
        <div className="w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-white mb-3 font-serif drop-shadow-sm">Welcome Back</h1>
            <p className="text-gray-200 font-medium text-sm sm:text-base">Sekali Tap, Rute & Tiket Beres.</p>
          </div>

          <form className="space-y-5" onSubmit={async (e) => { 
            e.preventDefault(); 
            const email = (e.target as any)[0].value;
            const password = (e.target as any)[1].value;
            try {
              const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
              });
              const json = await res.json();
              if (res.ok) {
                window.location.href='/dashboard';
              } else {
                alert(json.error || 'Login gagal.');
              }
            } catch(e) {
              alert('Terjadi kesalahan jaringan.');
            }
          }}>
            <div>
              <label className="block text-[11px] font-bold text-gray-200/90 mb-2 uppercase tracking-[0.15em]">Email Address</label>
              <input 
                type="email" 
                placeholder="name@example.com" 
                className="w-full px-5 py-4 rounded-2xl border border-white/25 bg-white/15 backdrop-blur-md text-white placeholder-gray-300 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium text-sm"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[11px] font-bold text-gray-200/90 uppercase tracking-[0.15em]">Password</label>
                <a href="#" className="text-xs font-bold text-beigeLight hover:text-white transition-colors">Forgot password?</a>
              </div>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full px-5 py-4 rounded-2xl border border-white/25 bg-white/15 backdrop-blur-md text-white placeholder-gray-300 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium text-sm"
              />
            </div>

            <button type="submit" className="w-full bg-greenDark/90 backdrop-blur-md hover:bg-greenDark text-white py-4 rounded-2xl font-bold text-sm shadow-[0_8px_28px_rgba(45,90,39,0.45)] border border-white/20 transition-all transform hover:-translate-y-0.5 mt-6">
              Sign In
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-gray-200/80 font-medium">
            Don&apos;t have an account? <Link href="/signup" className="text-beigeLight font-bold hover:text-white transition-colors underline-offset-4 hover:underline">Sign Up</Link>
          </p>

          <div className="flex justify-center gap-6 mt-12 text-xs font-bold text-gray-300/80">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Help</a>
          </div>
        </div>
      </div>
    </div>
  );
}
