'use client';

import { useState, useEffect } from 'react';
import { AdminRole } from '@/types';

export function useAdminRole() {
  const [role, setRole] = useState<AdminRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let targetRole: AdminRole | null = null;

      // In UI development mode, allow toggling the role using a query param (e.g. ?role=editor)
      if (process.env.NODE_ENV !== 'production') {
        const params = new URLSearchParams(window.location.search);
        const roleParam = params.get('role');
        if (roleParam === 'editor' || roleParam === 'head_admin') {
          targetRole = roleParam;
          localStorage.setItem('nbac_admin_role', roleParam);
          document.cookie = `nbac_session=${roleParam}; path=/; max-age=3600; SameSite=Strict`;
        }
      }

      // Check session-backed cookie
      let sessionRole: AdminRole | null = null;
      if (typeof document !== 'undefined') {
        const cookies = document.cookie.split('; ');
        const sessionCookie = cookies.find(row => row.startsWith('nbac_session='));
        if (sessionCookie) {
          const val = sessionCookie.split('=')[1];
          if (val === 'head_admin' || val === 'editor') {
            sessionRole = val as AdminRole;
          }
        }
      }

      // In production, rely exclusively on session cookie. In development, fallback to localStorage if no cookie is set.
      if (sessionRole) {
        targetRole = sessionRole;
      } else if (process.env.NODE_ENV !== 'production') {
        const storedRole = localStorage.getItem('nbac_admin_role');
        if (storedRole === 'editor' || storedRole === 'head_admin') {
          targetRole = storedRole as AdminRole;
        }
      }

      setTimeout(() => {
        setRole(targetRole);
        setLoading(false);
      }, 0);
    }
  }, []);

  return {
    role,
    isAdmin: role === 'head_admin' || role === 'editor',
    isHeadAdmin: role === 'head_admin',
    loading,
    setRole: (newRole: AdminRole | null) => {
      setRole(newRole);
      if (typeof window !== 'undefined') {
        if (newRole) {
          localStorage.setItem('nbac_admin_role', newRole);
          document.cookie = `nbac_session=${newRole}; path=/; max-age=3600; SameSite=Strict`;
        } else {
          localStorage.removeItem('nbac_admin_role');
          document.cookie = `nbac_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        }
      }
    }
  };
}
