'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { User, Settings, Bell, Shield, LogOut, ChevronRight, MapPin, Ticket, Leaf, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/profile', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store' }
        });
        if (res.ok) {
          const json = await res.json();
          setProfile(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    // Basic logout logic: redirect to login and clear cookies
    document.cookie = 'taproute_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login');
  };

  return (
    <div className="p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[calc(100vh-2rem)]">
      
      <div className="max-w-4xl mx-auto w-full">
        {/* Header / Avatar */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white overflow-hidden shadow-lg relative bg-white flex items-center justify-center">
            <Image src="https://i.pravatar.cc/150?u=current_user" alt="User Avatar" fill className="object-cover" />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-greenDark animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Memuat profil...</p>
          </div>
        ) : (
          <>
            {/* User Info */}
            <div className="flex flex-col items-center gap-2 mb-12">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{profile?.name || 'Traveler'}</h1>
              <p className="text-sm font-medium text-gray-500 mb-2">{profile?.email || 'traveler@taproute.id'}</p>
            </div>

            {/* Settings Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Account Settings */}
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 pl-2">Account Settings</h3>
                <div className="space-y-1">
                  <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blueMedium/10 text-blueMedium flex items-center justify-center">
                        <User size={18} />
                      </div>
                      <span className="font-semibold text-sm text-gray-700">Personal Information</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </button>

                  <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center">
                        <Bell size={18} />
                      </div>
                      <span className="font-semibold text-sm text-gray-700">Notifications</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </button>

                  <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-greenDark/10 text-greenDark flex items-center justify-center">
                        <Shield size={18} />
                      </div>
                      <span className="font-semibold text-sm text-gray-700">Privacy & Security</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </button>
                </div>
              </div>

              {/* Preferences & Actions */}
              <div className="flex flex-col gap-8">
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 pl-2">App Preferences</h3>
                  <div className="space-y-1">
                    <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                          <Settings size={18} />
                        </div>
                        <span className="font-semibold text-sm text-gray-700">General Settings</span>
                      </div>
                      <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </button>
                  </div>
                </div>

                <button onClick={handleLogout} className="w-full bg-[#fffbfa] rounded-[2rem] p-6 shadow-sm border border-red-100 flex items-center justify-center gap-3 text-red-600 font-bold hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer group">
                  <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                  Logout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
