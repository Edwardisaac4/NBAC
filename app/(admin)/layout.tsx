'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { AdminTopbar } from '@/components/layout/admin-topbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Determine page title based on pathname
  const getPageTitle = (path: string) => {
    if (path === '/admin') return 'Overview Dashboard';
    if (path.startsWith('/admin/content')) return 'Content Manager';
    if (path.startsWith('/admin/reservations')) return 'Reservations Intake';
    if (path.startsWith('/admin/media')) return 'Media Gallery';
    if (path.startsWith('/admin/logs')) return 'Security Audit Logs';
    if (path.startsWith('/admin/login')) return 'Admin Login';
    return 'Admin Control Panel';
  };

  const title = getPageTitle(pathname);

  // If we are on the login page, do not render the sidebar and topbar
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-nbac-canvas text-nbac-text flex items-center justify-center">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nbac-canvas text-nbac-text flex">
      {/* Sidebar Navigation */}
      <AdminSidebar 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-64">
        {/* Top Header Controls */}
        <AdminTopbar 
          title={title} 
          onOpenMobileMenu={() => setMobileMenuOpen(true)} 
        />

        {/* Content Viewport */}
        <main className="flex-1 p-6 md:p-8 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
