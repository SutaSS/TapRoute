'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Compass, User, Menu, X, PlusCircle } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Trips', href: '/dashboard/my-trips', icon: Compass },
  { name: 'Create Trip', href: '/dashboard/create', icon: PlusCircle },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Header / Hamburger */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-beigeLight border-b border-greenDark/15 sticky top-0 z-50">
        <div className="flex flex-col">
          <div className="bg-white/80 backdrop-blur-sm p-1.5 rounded-xl shadow-sm border border-white/70 mb-1 w-fit">
            <Image src="/images/logo-2.png" alt="TapRoute Logo" width={80} height={24} className="object-contain" priority />
          </div>
          <span className="text-[10px] text-gray-600 tracking-wider font-semibold">AI TRAVEL CONCIERGE</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="text-greenDark">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Desktop & Mobile Overlay */}
      <aside
        className={`fixed left-0 top-[72px] bottom-0 z-40 w-[84vw] max-w-[280px] bg-beigeLight border-r border-greenDark/15 overflow-y-auto transform transition-transform duration-300 ease-in-out md:top-0 md:bottom-0 md:w-64 md:max-w-none md:translate-x-0 md:static md:flex md:flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="hidden md:flex flex-col p-6 mb-4 items-center text-center">
          <div className="bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-white/70 shadow-sm mb-3">
            <Image src="/images/logo-2.png" alt="TapRoute Logo" width={110} height={32} className="object-contain" priority />
          </div>
          <span className="text-[11px] text-gray-600 tracking-widest font-bold">AI TRAVEL CONCIERGE</span>
        </div>

        <nav className="flex-1 px-4 py-4 pb-6 md:py-0 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'bg-white text-greenDark border border-white/70 shadow-[0_4px_12px_rgba(0,0,0,0.15)] font-extrabold'
                    : 'text-gray-700 hover:bg-white/60 hover:backdrop-blur-md hover:border hover:border-white/80 hover:text-greenDark font-medium border border-transparent'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-greenDark' : 'text-gray-500'} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
