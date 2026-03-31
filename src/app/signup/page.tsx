'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-beigeLight selection:bg-greenDark selection:text-white pb-safe">
      
      {/* Right Image/Banner Section (On Left for Signup for variation, or keep right. Let's keep right for consistency) */}
      <div className="hidden md:flex md:w-1/2 relative p-4 pr-0">
        <div className="w-full h-full rounded-r-[3rem] overflow-hidden relative shadow-2xl">
          <Image src="/images/login-bg.png" alt="Travel Landscape" fill className="object-cover" priority style={{ transform: 'scaleX(-1)' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-greenDark/60 via-transparent to-transparent mix-blend-multiply" />
          
          <div className="absolute inset-0 p-16 flex flex-col justify-end text-white animate-in slide-in-from-bottom-8 duration-1000 delay-300">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/80 mb-4 border-b border-white/30 pb-2 inline-block w-fit">Join the Journey</span>
            <h2 className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-none mb-8">
              Your Next <br/>Adventure <br/>Starts <br/>Here.
            </h2>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-sm flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-greenDark/30 border border-white/20 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1">Join the Community</h4>
                <p className="text-xs text-white/80 leading-relaxed">Connect with thousands of travelers who are discovering the world, the smart way.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="w-full md:w-1/2 flex flex-col p-8 md:p-16 lg:p-24 justify-center animate-in fade-in slide-in-from-right-4 duration-700">
        <Link href="/" className="flex items-center gap-2 mb-16 md:mb-24">
          <Image src="/images/logo.png" alt="TapRoute Logo" width={32} height={32} className="rounded-lg" />
          <span className="text-xl font-bold text-greenDark">TapRoute</span>
        </Link>
        
        <div className="max-w-md w-full mx-auto md:mx-0">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 font-serif">Create Account</h1>
          <p className="text-gray-600 mb-8 font-medium">Bergabung dan mulai rencanakan liburanmu.</p>

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
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Full Name</label>
              <input 
                type="text" 
                placeholder="John Doe" 
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-greenDark/20 transition-all font-medium text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Email Address</label>
              <input 
                type="email" 
                placeholder="name@example.com" 
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-greenDark/20 transition-all font-medium text-sm"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-greenDark/20 transition-all font-medium text-sm"
              />
            </div>

            <button type="submit" className="w-full bg-greenDark hover:bg-[#20401b] text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-greenDark/20 transition-all transform hover:-translate-y-0.5 mt-2">
              Sign Up
            </button>
          </form>



          <p className="text-center mt-6 text-sm text-gray-500 font-medium">
            Already have an account? <Link href="/login" className="text-greenDark font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>

    </div>
  );
}
