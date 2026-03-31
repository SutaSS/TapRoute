'use client';

// Halaman /trip/[id] — redirect ke /dashboard/trip/[id]
// Ini memastikan kompatibilitas link lama
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function TripRedirectPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    if (params?.id) {
      router.replace(`/dashboard/trip/${params.id}`);
    } else {
      router.replace('/dashboard');
    }
  }, [params, router]);

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gray-950 relative px-4">
      <div className="absolute inset-0 bg-gradient-to-tr from-greenDark/30 to-gray-900/50" />
      <div className="relative z-10 flex flex-col items-center gap-6 p-6 sm:p-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] animate-pulse">
        <div className="bg-white/20 backdrop-blur-md p-4 rounded-3xl border border-white/30 shadow-lg">
          <img src="/images/logo-2.png" alt="TapRoute Logo" width={80} height={80} className="rounded-2xl object-cover" />
        </div>
        <div className="h-4 bg-white/40 rounded-xl w-32 backdrop-blur-sm" />
      </div>
    </div>
  );
}
