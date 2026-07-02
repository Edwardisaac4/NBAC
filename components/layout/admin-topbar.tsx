'use client';

import React from 'react';
import { Menu, Bell, Shield, Moon, Sun, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminRole } from '@/hooks/use-admin-role';

interface AdminTopbarProps {
  title: string;
  onOpenMobileMenu?: () => void;
}

export function AdminTopbar({ title, onOpenMobileMenu }: AdminTopbarProps) {
  const { role, isHeadAdmin } = useAdminRole();

  return (
    <header className="sticky top-0 right-0 z-20 flex items-center justify-between px-6 h-20 bg-nbac-canvas/80 backdrop-blur-md border-b border-nbac-border text-nbac-text select-none">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden text-nbac-body hover:text-nbac-gold p-1.5 rounded-lg border border-nbac-border bg-[#0b0f10]/40 transition-colors"
          aria-label="Open sidebar menu"
        >
          <Menu size={20} />
        </button>

        {/* Dynamic Page Title */}
        <h1 className="font-sans text-xl font-bold tracking-tight text-nbac-text">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications Icon */}
        <button 
          onClick={() => alert('Notifications clicked (mocked UI)')}
          className="relative p-2 text-nbac-body hover:text-nbac-gold hover:bg-nbac-panel border border-nbac-border rounded-lg bg-nbac-panel/40 transition-all duration-200"
          aria-label="View notifications"
        >
          <Bell size={18} />
          {/* Notification Indicator Dot */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-nbac-amber ring-2 ring-[#0b0f10]" />
        </button>

        {/* Quick Settings Icon */}
        <button 
          onClick={() => alert('Settings clicked (mocked UI)')}
          className="p-2 text-nbac-body hover:text-nbac-gold hover:bg-nbac-panel border border-nbac-border rounded-lg bg-nbac-panel/40 transition-all duration-200"
          aria-label="Settings"
        >
          <Settings size={18} />
        </button>

        {/* Head Admin Mode / Editor Mode Badge */}
        {isHeadAdmin ? (
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-nbac-gold via-nbac-gold-light to-nbac-gold text-[#0b0f10] border border-nbac-gold-light/25 shadow-lg shadow-nbac-gold/15 rounded-full font-sans text-xs font-semibold uppercase tracking-wider select-none animate-pulse-subtle">
            <Shield size={13} strokeWidth={2.5} />
            <span>Head Admin Mode</span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-nbac-panel border border-nbac-border text-nbac-muted rounded-full font-sans text-xs font-semibold uppercase tracking-wider">
            <span>Editor Mode</span>
          </div>
        )}
      </div>
    </header>
  );
}
