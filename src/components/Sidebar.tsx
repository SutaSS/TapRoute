'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Compass, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Trips', href: '/dashboard/my-trips', icon: Compass },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Header / Hamburger */}
      <div className="md:hidden flex items-center justify-between p-4 bg-beigeLight border-b border-greenDark/10 sticky top-0 z-50">
        <div className="flex flex-col">
          <span className="text-xl font-bold text-greenDark leading-none">TapRoute</span>
          <span className="text-[10px] text-gray-500 tracking-wider">AI TRAVEL CONCIERGE</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="text-greenDark">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Desktop & Mobile Overlay */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-beigeLight border-r border-greenDark/10 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex md:flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="hidden md:flex flex-col p-6 mb-4">
          <span className="text-2xl font-bold text-greenDark leading-none mb-1">TapRoute</span>
          <span className="text-xs text-gray-500 tracking-widest font-medium">AI TRAVEL CONCIERGE</span>
        </div>

        <nav className="flex-1 px-4 py-8 md:py-0 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-greenDark/10 text-greenDark font-semibold'
                    : 'text-gray-600 hover:bg-greenDark/5 hover:text-greenDark'
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
