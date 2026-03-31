'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="relative min-h-[100dvh] flex items-center justify-center selection:bg-greenDark selection:text-white py-6 sm:py-8 px-4 sm:px-6">
      
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0 bg-white">
        <Image src="/images/gunung.png" alt="Travel Landscape bg" fill className="object-cover opacity-15" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-beigeLight/10 via-white/10 to-white/20" />
      </div>

      {/* Center Glass Form Section */}
      <div className="relative z-10 w-full max-w-md flex flex-col p-6 sm:p-12 justify-center bg-white/50 backdrop-blur-xl border border-white/60 rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.05)] animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        <Link href="/" className="flex flex-col items-center justify-center gap-4 mb-8 w-full hover:opacity-80 transition-opacity">
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-white shadow-lg">
            <Image src="/images/logo-2.png" alt="TapRoute Logo" width={120} height={120} className="rounded-2xl object-cover" />
          </div>
        </Link>
        
        <div className="w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-3 font-serif drop-shadow-sm">Create Account</h1>
            <p className="text-gray-600 font-medium text-sm sm:text-base">Mulai rencanakan liburanmu bersama AI.</p>
          </div>

          <form className="space-y-4" onSubmit={async (e) => { 
            e.preventDefault(); 
            const name = (e.target as any)[0].value;
            const email = (e.target as any)[1].value;
            const password = (e.target as any)[2].value;
            try {
              const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
              });
              const json = await res.json();
              if (res.ok) {
                window.location.href='/dashboard';
              } else {
                alert(json.error || 'Registrasi gagal.');
              }
            } catch(e) {
              alert('Terjadi kesalahan jaringan.');
            }
          }}>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-[0.15em]">Full Name</label>
              <input 
                type="text" 
                placeholder="John Doe" 
                className="w-full px-5 py-4 rounded-2xl border border-white/60 bg-white/70 backdrop-blur-md text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-400/50 transition-all font-medium text-sm shadow-inner"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-[0.15em]">Email Address</label>
              <input 
                type="email" 
                placeholder="name@example.com" 
                className="w-full px-5 py-4 rounded-2xl border border-white/60 bg-white/70 backdrop-blur-md text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-400/50 transition-all font-medium text-sm shadow-inner"
              />
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-[0.15em]">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full px-5 py-4 rounded-2xl border border-white/60 bg-white/70 backdrop-blur-md text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-400/50 transition-all font-medium text-sm shadow-inner"
              />
            </div>

            <button type="submit" className="w-full bg-greenDark/90 backdrop-blur-md hover:bg-greenDark text-white py-4 rounded-2xl font-bold text-sm shadow-[0_4px_20px_rgba(34,197,94,0.3)] border border-green-500/30 transition-all transform hover:-translate-y-0.5 mt-6">
              Sign Up
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-gray-500 font-medium">
            Already have an account? <Link href="/login" className="text-greenDark font-bold hover:text-[#20401b] transition-colors underline-offset-4 hover:underline">Sign In</Link>
          </p>

          <div className="flex justify-center gap-6 mt-12 text-xs font-bold text-gray-400">
            <a href="#" className="hover:text-gray-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Help</a>
          </div>
        </div>
      </div>
    </div>
  );
}
