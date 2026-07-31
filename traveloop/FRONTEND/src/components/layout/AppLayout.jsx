import { useState } from 'react';
import SidebarNavigation from './SidebarNavigation';
import MobileBottomNav from '../ui/MobileBottomNav';

export default function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 transition-colors duration-250">
      {/* Sidebar for Desktop / Tablet */}
      <SidebarNavigation collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileBottomNav />
    </div>
  );
}
