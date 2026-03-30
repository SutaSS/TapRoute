'use client';

import Image from 'next/image';
import { User, Settings, Bell, Shield, LogOut, ChevronRight, MapPin, Ticket, Leaf } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  return (
    <div className="p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[calc(100vh-2rem)]">
      
      <div className="max-w-4xl mx-auto w-full">
        {/* Header / Cover */}
        <div className="relative w-full h-[150px] md:h-[200px] rounded-[2rem] overflow-hidden shadow-sm mb-16 md:mb-20">
          <Image src="/images/login-bg.png" alt="Cover" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-greenDark/40 mix-blend-multiply" />
          
          {/* Avatar Container positioned to overlap */}
          <div className="absolute -bottom-12 md:-bottom-16 left-6 md:left-10 z-10 flex items-end">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white overflow-hidden shadow-lg relative bg-white">
              <Image src="https://i.pravatar.cc/150?u=current_user" alt="User Avatar" fill className="object-cover" />
            </div>
          </div>
        </div>

        {/* User Info & Stats */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-12 pl-6 md:pl-[180px]">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">John Doe</h1>
            <p className="text-sm font-medium text-gray-500 mb-2">john.doe@example.com</p>
            <div className="flex items-center gap-2">
              <span className="bg-greenDark/10 text-greenDark text-[10px] font-bold px-3 py-1 rounded-full border border-greenDark/20 uppercase tracking-widest">
                Premium Member
              </span>
            </div>
          </div>
          
          <div className="flex bg-white rounded-2xl shadow-sm border border-gray-100 p-2 shrink-0 md:-mt-8 relative z-20">
            <div className="px-5 py-3 text-center border-r border-gray-100">
              <Ticket size={20} className="text-blueMedium mx-auto mb-1 opacity-70" />
              <div className="text-xl font-bold text-gray-900">4</div>
              <div className="text-[10px] uppercase font-bold text-gray-500">Trips</div>
            </div>
            <div className="px-5 py-3 text-center border-r border-gray-100">
              <MapPin size={20} className="text-yellow-500 mx-auto mb-1 opacity-70" />
              <div className="text-xl font-bold text-gray-900">12</div>
              <div className="text-[10px] uppercase font-bold text-gray-500">UMKM</div>
            </div>
            <div className="px-5 py-3 text-center">
              <Leaf size={20} className="text-greenDark mx-auto mb-1 opacity-70" />
              <div className="text-xl font-bold text-gray-900">85%</div>
              <div className="text-[10px] uppercase font-bold text-gray-500">Impact</div>
            </div>
          </div>
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

            <Link href="/" className="bg-[#fffbfa] rounded-[2rem] p-6 shadow-sm border border-red-100 flex items-center justify-center gap-3 text-red-600 font-bold hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer group">
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
              Logout
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
