'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Image as ImageIcon, 
  Lock, 
  User, 
  LogOut,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminRole } from '@/hooks/use-admin-role';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { role, isHeadAdmin } = useAdminRole();

  const menuItems = [
    {
      label: 'Overview',
      href: '/admin',
      icon: LayoutDashboard,
      roles: ['head_admin', 'editor']
    },
    {
      label: 'Content Manager',
      href: '/admin/content',
      icon: FileText,
      roles: ['head_admin', 'editor']
    },
    {
      label: 'Reservations',
      href: '/admin/reservations',
      icon: Users,
      roles: ['head_admin', 'editor']
    },
    {
      label: 'Media Gallery',
      href: '/admin/media',
      icon: ImageIcon,
      roles: ['head_admin', 'editor']
    },
    {
      label: 'Security Logs',
      href: '/admin/logs',
      icon: Lock,
      roles: ['head_admin'] // Head Admin only
    }
  ];

  // Filter items based on current admin role
  const filteredItems = menuItems.filter(item => role ? item.roles.includes(role) : false);

  const content = (
    <div className="flex flex-col h-full bg-[#0b0f10] border-r border-nbac-border text-nbac-text select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between p-6 border-b border-nbac-border h-20">
        <Link href="/admin" className="flex flex-col group">
          <span className="font-display text-2xl font-bold bg-gradient-to-r from-nbac-emerald via-nbac-gold to-nbac-gold-light bg-clip-text text-transparent tracking-tight">
            NBAC
          </span>
          <span className="font-sans text-[10px] uppercase tracking-widest font-semibold text-nbac-muted group-hover:text-nbac-gold transition-colors">
            Admin Panel
          </span>
        </Link>
        {onClose && (
          <button 
            onClick={onClose} 
            className="lg:hidden text-nbac-muted hover:text-nbac-gold p-1 rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 space-y-1.5 overflow-y-auto px-3">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3.5 px-4 py-3 rounded-lg font-sans text-sm font-light tracking-wide transition-all duration-200 group relative overflow-hidden",
                isActive 
                  ? "border-l-[3px] border-nbac-gold bg-nbac-gold/5 text-nbac-gold-light font-medium" 
                  : "text-nbac-body hover:bg-nbac-panel hover:text-nbac-gold-light"
              )}
            >
              {/* Active Glow Backdrop */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-nbac-gold/5 to-transparent pointer-events-none" />
              )}
              
              <Icon 
                size={18} 
                className={cn(
                  "transition-colors", 
                  isActive ? "text-nbac-gold-light" : "text-nbac-muted group-hover:text-nbac-gold"
                )} 
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section / Footer */}
      <div className="p-4 border-t border-nbac-border bg-[#070b0c] space-y-4">
        {/* User Card */}
        <div className="flex items-center gap-3 px-2">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-nbac-panel border border-nbac-border shadow-inner text-nbac-gold-light">
            <User size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-sans text-xs font-semibold text-nbac-text truncate">
              User Profile
            </p>
            <p className="font-sans text-[10px] text-nbac-muted truncate capitalize">
              {role ? role.replace('_', ' ') : ''}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button 
          onClick={() => {
            console.log('Logging out...');
            alert('Logout action triggered (mocked UI)');
          }}
          className="flex items-center justify-center gap-2 w-full border border-nbac-border text-nbac-body hover:bg-nbac-panel hover:text-nbac-danger hover:border-nbac-danger/35 font-sans font-medium px-4 py-2 rounded-lg transition-colors text-xs"
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (lg and above) */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 z-30">
        {content}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <aside 
        inert={!isOpen}
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 w-64 z-50 transform transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {content}
      </aside>
    </>
  );
}
