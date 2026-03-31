import React from 'react';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-beigeLight">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto w-full max-w-[1200px] mx-auto bg-gray-50 md:bg-white rounded-none md:rounded-3xl shadow-sm my-0 md:my-4 md:mr-4">
        {children}
      </main>
    </div>
  );
}
