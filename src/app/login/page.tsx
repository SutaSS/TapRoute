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

          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); window.location.href='/dashboard'; }}>
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

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-beigeLight px-4 text-gray-500 font-bold tracking-wider uppercase">Or continue with</span>
            </div>
          </div>

          <button onClick={() => window.location.href='/dashboard'} className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-colors shadow-sm">
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true"><path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.25024 6.60998L5.32028 9.77C6.27528 6.61001 9.19533 4.75 12.0003 4.75Z" fill="#EA4335"/><path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L20.18 21.29C22.57 19.09 24 15.93 24 12.275H23.49Z" fill="#4285F4"/><path d="M5.31998 14.2301C5.07998 13.5101 4.93998 12.7701 4.93998 12.0001C4.93998 11.2301 5.07998 10.4901 5.31998 9.77005L1.24994 6.61005C0.449944 8.23005 0 10.0601 0 12.0001C0 13.9401 0.449944 15.7701 1.24994 17.3901L5.31998 14.2301Z" fill="#FBBC05"/><path d="M12.0003 24C15.2403 24 17.9653 22.93 19.9653 21.09L15.8953 17.9C14.8153 18.63 13.5053 19.06 12.0003 19.06C9.19533 19.06 6.27528 17.2 5.32028 14.04L1.25024 17.2C3.25527 21.31 7.31028 24 12.0003 24Z" fill="#34A853"/></svg>
            Google
          </button>

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
