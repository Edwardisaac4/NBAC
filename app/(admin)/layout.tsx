'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { AdminTopbar } from '@/components/layout/admin-topbar';
import { useAdminRole } from '@/hooks/use-admin-role';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, loading } = useAdminRole();

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!loading && !isAdmin && !isLoginPage) {
      router.push('/admin/login');
    }
  }, [isAdmin, loading, isLoginPage, router]);

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

  // Check if we are in the full-screen writing editor workspace
  const isWorkspace = pathname === '/admin/content/new/editor' || pathname.endsWith('/edit');

  // Render a simple preloader while session check is loading
  if (loading) {
    return (
      <div className="min-h-screen bg-nbac-canvas text-nbac-text flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-nbac-emerald border-t-transparent animate-spin" />
        <span className="font-sans text-xs uppercase tracking-widest font-semibold text-nbac-muted">
          Decrypting session...
        </span>
      </div>
    );
  }

  // If unauthenticated and not on the login page, prevent flash of layout
  if (!isAdmin && !isLoginPage) {
    return null;
  }

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-nbac-canvas text-nbac-text flex items-center justify-center">
        {children}
      </div>
    );
  }

  // Workspace mode: full-screen editor layout
  if (isWorkspace) {
    return (
      <div className="min-h-screen bg-nbac-canvas text-nbac-text overflow-hidden">
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
