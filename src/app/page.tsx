import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Compass } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-beigeLight selection:bg-greenDark selection:text-white">
      {/* Navbar Minimalist */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center fixed top-0 z-50 bg-beigeLight/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Image src="/images/logo.png" alt="TapRoute Logo" width={32} height={32} className="rounded-lg" />
          <span className="text-xl font-bold text-greenDark">TapRoute</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="text-sm font-semibold text-greenDark py-2 px-4 hover:bg-greenDark/5 rounded-full transition-colors">
            Log In
          </Link>
          <Link href="/login" className="text-sm font-semibold text-white bg-greenDark hover:bg-[#20401b] py-2 px-6 rounded-full transition-colors shadow-sm">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 flex flex-col justify-center items-center text-center mt-32 md:mt-0 pt-24 pb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blueMedium/10 text-blueMedium text-xs font-bold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Compass size={14} />
          <span>Voted #1 AI Travel App in 2026</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight max-w-4xl animate-in fade-in slide-in-from-bottom-6 duration-700">
          Sekali Tap, Rute & Tiket <span className="text-greenDark relative z-10">Beres.</span>
        </h1>
        
        <p className="mt-8 text-lg md:text-xl text-gray-600 max-w-2xl font-medium animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          The smart AI Concierge for seamless travel. Let our AI analyze millions of data points to curate your perfect itinerary in seconds.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200">
          <Link href="/login" className="flex items-center justify-center gap-2 bg-greenDark hover:bg-[#20401b] text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-greenDark/20 transition-all hover:-translate-y-1">
            Start Planning Free <ArrowRight size={20} />
          </Link>
          <button className="flex items-center justify-center gap-2 bg-white text-gray-900 border-2 border-gray-200 hover:border-gray-300 px-8 py-4 rounded-full font-bold text-lg transition-colors">
            View Live Demo
          </button>
        </div>

        {/* Feature Visual/Mockup Spacer */}
        <div className="mt-24 relative w-full max-w-5xl aspect-video rounded-t-3xl overflow-hidden shadow-2xl border border-gray-200 bg-white animate-in slide-in-from-bottom-16 fade-in duration-1000 delay-300">
          <Image src="/images/banner.png" alt="Dashboard Preview" fill className="object-cover opacity-80" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-beigeLight to-transparent" />
        </div>
      </main>
    </div>
  );
}
