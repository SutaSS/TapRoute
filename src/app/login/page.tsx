'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-beigeLight selection:bg-greenDark selection:text-white pb-safe">
      
      {/* Left Form Section */}
      <div className="w-full md:w-1/2 flex flex-col p-8 md:p-16 lg:p-24 justify-center animate-in fade-in slide-in-from-left-4 duration-700">
        <Link href="/" className="flex items-center gap-2 mb-20 md:mb-32">
          <Image src="/images/logo.png" alt="TapRoute Logo" width={32} height={32} className="rounded-lg" />
          <span className="text-xl font-bold text-greenDark">TapRoute</span>
        </Link>
        
        <div className="max-w-md w-full mx-auto md:mx-0">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 font-serif">Welcome Back</h1>
          <p className="text-gray-600 mb-10 font-medium">Sekali Tap, Rute & Tiket Beres.</p>

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
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Email Address</label>
              <input 
                type="email" 
                placeholder="name@example.com" 
                className="w-full px-4 py-4 rounded-xl border border-gray-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-greenDark/20 transition-all font-medium text-sm"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Password</label>
                <a href="#" className="text-xs font-bold text-blueMedium hover:underline">Forgot password?</a>
              </div>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full px-4 py-4 rounded-xl border border-gray-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-greenDark/20 transition-all font-medium"
              />
            </div>

            <button type="submit" className="w-full bg-greenDark hover:bg-[#20401b] text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-greenDark/20 transition-all transform hover:-translate-y-0.5 mt-4">
              Sign In
            </button>
          </form>



          <p className="text-center mt-8 text-sm text-gray-500 font-medium">
            Don&apos;t have an account? <Link href="/signup" className="text-greenDark font-bold hover:underline">Sign Up</Link>
          </p>

          <div className="flex justify-center gap-6 mt-16 text-xs font-bold text-gray-400">
            <a href="#" className="hover:text-gray-600">Privacy Policy</a>
            <a href="#" className="hover:text-gray-600">Terms of Service</a>
            <a href="#" className="hover:text-gray-600">Help Center</a>
          </div>
        </div>
      </div>

      {/* Right Image/Banner Section */}
      <div className="hidden md:flex md:w-1/2 relative p-4 pl-0">
        <div className="w-full h-full rounded-l-[3rem] overflow-hidden relative shadow-2xl">
          <Image src="/images/login-bg.png" alt="Travel Landscape" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-greenDark/60 via-transparent to-transparent mix-blend-multiply" />
          
          <div className="absolute inset-0 p-16 flex flex-col justify-end text-white animate-in slide-in-from-bottom-8 duration-1000 delay-300">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/80 mb-4 border-b border-white/30 pb-2 inline-block w-fit">Premium Concierge</span>
            <h2 className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-none mb-8">
              The AI <br/>Concierge <br/>for Seamless <br/>Travel.
            </h2>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-sm flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-greenDark/30 border border-white/20 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1">Smart Route Optimization</h4>
                <p className="text-xs text-white/80 leading-relaxed">Our AI analyzes millions of data points to find your perfect itinerary in seconds.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
