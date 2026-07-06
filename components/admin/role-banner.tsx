'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useAdminRole } from '@/hooks/use-admin-role';

export function RoleBanner() {
  const { isHeadAdmin } = useAdminRole();

  if (!isHeadAdmin) return null;

  return (
    <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-nbac-gold/5 border border-nbac-gold/20 rounded-lg text-nbac-gold-light font-sans text-xs sm:text-sm select-none shadow-sm shadow-nbac-gold/5">
      <ShieldAlert size={16} className="text-nbac-gold shrink-0" />
      <span className="font-light tracking-wide">
        <strong className="font-semibold text-nbac-gold-light">Head Admin Mode Active</strong> — Global write permissions enabled. All database actions, exports, and updates are monitored and recorded.
      </span>
    </div>
  );
}
