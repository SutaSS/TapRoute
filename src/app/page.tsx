import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative min-h-[100dvh] flex flex-col selection:bg-greenDark selection:text-white overflow-hidden">
      
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0 bg-gray-900">
        <Image 
          src="/images/pantai.png" 
          alt="Beach Background" 
          fill 
          priority
          className="object-cover opacity-80"
        />
        {/* Main gradient: dark at bottom, very bright at top for logo contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#061b2d]/90 via-[#0A2F4D]/35 to-white/90" />
        {/* Gradient and Blur Overlay at the bottom */}
        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[#061b2d]/85 via-[#0A2F4D]/25 to-transparent backdrop-blur-[4px]" />
        {/* Subtle dark overlay for readability everywhere */}
        <div className="absolute inset-0 bg-black/5" />
      </div>

      {/* Navbar Minimalist */}
      <nav className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex justify-end items-center gap-3 relative z-20">
        
        <div className="flex gap-2 sm:gap-4">
          <Link href="/login" className="text-xs sm:text-sm font-bold text-greenDark py-2 px-4 sm:px-5 hover:bg-white/10 rounded-full transition-colors backdrop-blur-md border-2 border-white/80 outline outline-1 outline-black/20 shadow-[0_4px_14px_rgba(0,0,0,0.2)] whitespace-nowrap">
            Log In
          </Link>
          <Link href="/signup" className="text-xs sm:text-sm font-bold text-greenDark bg-white hover:bg-gray-100 py-2 px-5 sm:px-6 rounded-full transition-colors border-2 border-greenDark/70 outline outline-1 outline-white/30 shadow-lg shadow-black/20 whitespace-nowrap">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col justify-center items-center text-center relative z-20 pt-8 sm:pt-10 pb-20 sm:pb-32">

        <div className="mb-10 -mt-6 sm:-mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Image src="/images/logo-2.png" alt="TapRoute Brand Logo" width={340} height={340} priority className="object-contain hover:scale-105 transition-transform duration-500 drop-shadow-[0_10px_28px_rgba(0,0,0,0.4)]" />
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.08] max-w-5xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 drop-shadow-2xl">
          Sekali Tap, Rute & Tiket <span className="text-beigeLight inline-block relative">Beres.<span className="absolute bottom-1 left-0 w-full h-3 bg-greenDark/45 -z-10 rounded-full blur-sm"></span></span>
        </h1>
        
        <p className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl font-medium animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 drop-shadow-lg leading-relaxed">
          Asisten AI pintar untuk liburan tanpa pusing. Biarkan agen cerdas kami menyusun itinerary sempurna dan memesan tiket kamu dalam hitungan detik.
        </p>

        <div className="mt-10 sm:mt-14 w-full flex justify-center animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200">
          {/* CTA Ayo Mencoba */}
          <Link 
            href="/login" 
            className="group relative inline-flex items-center justify-center gap-3 bg-greenDark hover:bg-[#20401b] text-white px-7 sm:px-10 py-4 sm:py-5 rounded-full font-extrabold text-base sm:text-xl shadow-[0_0_40px_-5px_rgba(45,90,39,0.45)] transition-all hover:scale-105 active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] skew-x-12"></div>
            <span className="relative z-10">Buat Itinerary Instan</span>
            <ArrowRight size={24} className="relative z-10 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </main>
    </div>
  );
}
