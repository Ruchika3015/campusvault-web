import { Outlet } from 'react-router-dom';
import { WorkshopNav } from '@/components/workshop/WorkshopNav';

/**
 * Shared layout for all authenticated dashboard pages.
 * Provides the workshop atmosphere + navigation.
 * Child routes render inside <Outlet />.
 */
export function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-bg-0 text-ink-0 overflow-x-hidden w-full max-w-full">
      <div className="fixed inset-0 tech-diagram pointer-events-none opacity-40" />
      <div className="fixed inset-0 haze pointer-events-none" />
      <div className="fixed inset-0 depth-fog pointer-events-none" />
      <div className="bg-lettering fixed hidden sm:flex">WORKSHOP</div>

      <WorkshopNav />

      <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-20 w-full">
        {children || <Outlet />}
      </main>
    </div>
  );
}
