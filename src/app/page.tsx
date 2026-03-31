import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Compass } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col selection:bg-greenDark selection:text-white overflow-hidden">
      
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0 bg-gray-900">
        <Image 
          src="/images/banner.png" 
          alt="Beach Background" 
          fill 
          priority
          className="object-cover opacity-80"
        />
        {/* Gradient and Blur Overlay at the bottom */}
        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent backdrop-blur-[4px]" />
        {/* Subtle dark overlay for readability everywhere */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Navbar Minimalist */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1.5 rounded-xl shadow-md">
            <Image src="/images/logo.png" alt="TapRoute Logo" width={28} height={28} className="rounded-lg" />
          </div>
          <span className="text-2xl font-extrabold text-white tracking-tight drop-shadow-md">TapRoute</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="text-sm font-bold text-white py-2 px-5 hover:bg-white/10 rounded-full transition-colors backdrop-blur-md border border-white/20">
            Log In
          </Link>
          <Link href="/login" className="text-sm font-bold text-greenDark bg-white hover:bg-gray-100 py-2 px-6 rounded-full transition-colors shadow-lg shadow-black/20">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 flex flex-col justify-center items-center text-center relative z-20 pt-10 pb-32">

        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-4xl animate-in fade-in slide-in-from-bottom-6 duration-700 drop-shadow-2xl">
          Sekali Tap, Rute & Tiket <span className="text-green-400 inline-block relative">Beres.<span className="absolute bottom-2 left-0 w-full h-3 bg-green-500/30 -z-10 rounded-full blur-sm"></span></span>
        </h1>
        
        <p className="mt-8 text-lg md:text-xl text-gray-200 max-w-2xl font-medium animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 drop-shadow-lg leading-relaxed">
          Asisten AI pintar untuk liburan tanpa pusing. Biarkan agen cerdas kami menyusun itinerary sempurna dan memesan tiket kamu dalam hitungan detik.
        </p>

        <div className="mt-14 w-full flex justify-center animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200">
          {/* CTA Ayo Mencoba */}
          <Link 
            href="/login" 
            className="group relative inline-flex items-center justify-center gap-3 bg-green-500 hover:bg-green-400 text-white px-10 py-5 rounded-full font-extrabold text-xl shadow-[0_0_40px_-5px_rgba(34,197,94,0.4)] transition-all hover:scale-105 active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] skew-x-12"></div>
            <span className="relative z-10">Ayo Mencoba</span>
            <ArrowRight size={24} className="relative z-10 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </main>
    </div>
  );
}
