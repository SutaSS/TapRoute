import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Compass } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative min-h-[100dvh] flex flex-col selection:bg-greenDark selection:text-white overflow-hidden">
      
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
      <nav className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex justify-between items-center gap-3 relative z-20">
        <div className="flex items-center gap-4">
          <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] font-serif">TapRoute</span>
        </div>
        <div className="flex gap-2 sm:gap-4">
          <Link href="/login" className="text-xs sm:text-sm font-bold text-white py-2 px-4 sm:px-5 hover:bg-white/10 rounded-full transition-colors backdrop-blur-md border border-white/20 whitespace-nowrap">
            Log In
          </Link>
          <Link href="/signup" className="text-xs sm:text-sm font-bold text-greenDark bg-white hover:bg-gray-100 py-2 px-5 sm:px-6 rounded-full transition-colors shadow-lg shadow-black/20 whitespace-nowrap">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col justify-center items-center text-center relative z-20 pt-8 sm:pt-10 pb-20 sm:pb-32">

        <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-white/20 backdrop-blur-xl p-6 md:p-10 rounded-[3rem] shadow-[0_8px_32px_rgba(0,0,0,0.25)] border border-white/30 inline-block hover:bg-white/30 transition-colors">
            <Image src="/images/logo-2.png" alt="TapRoute Brand Logo" width={220} height={220} priority className="object-contain hover:scale-110 transition-transform duration-500 drop-shadow-xl" />
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.05] max-w-5xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 drop-shadow-2xl">
          Sekali Tap, Rute & Tiket <span className="text-greenDark inline-block relative">Beres.<span className="absolute bottom-2 left-0 w-full h-3 bg-greenDark/30 -z-10 rounded-full blur-sm"></span></span>
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
