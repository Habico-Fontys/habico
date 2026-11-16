import type { ReactNode } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import MobileNav from '@/components/MobileNav';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-habico-landing min-h-screen md:flex">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Topbar />
        <div className="pb-28 md:pb-0">{children}</div>
      </div>
      <MobileNav />
    </div>
  );
}
