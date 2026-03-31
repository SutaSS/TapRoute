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
    <div className="min-h-screen flex items-center justify-center bg-beigeLight">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <div className="w-8 h-8 rounded-full bg-greenDark/30" />
        <div className="h-4 bg-gray-200 rounded-xl w-32" />
      </div>
    </div>
  );
}
