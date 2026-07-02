'use client';

import { useState, useEffect } from 'react';
import { AdminRole } from '@/types';

export function useAdminRole() {
  const [role, setRole] = useState<AdminRole>('head_admin');

  useEffect(() => {
    // In UI development mode, allow toggling the role using a query param (e.g. ?role=editor)
    // or falling back to localStorage
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get('role');
      let targetRole: AdminRole | null = null;

      if (roleParam === 'editor' || roleParam === 'head_admin') {
        targetRole = roleParam;
        localStorage.setItem('nbac_admin_role', roleParam);
      } else {
        const storedRole = localStorage.getItem('nbac_admin_role');
        if (storedRole === 'editor' || storedRole === 'head_admin') {
          targetRole = storedRole as AdminRole;
        }
      }

      if (targetRole && targetRole !== 'head_admin') {
        // Defer the state update to avoid cascading render warning in React
        const timer = setTimeout(() => {
          setRole(targetRole!);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  return {
    role,
    isAdmin: role === 'head_admin' || role === 'editor',
    isHeadAdmin: role === 'head_admin',
    setRole: (newRole: AdminRole) => {
      setRole(newRole);
      if (typeof window !== 'undefined') {
        localStorage.setItem('nbac_admin_role', newRole);
      }
    }
  };
}
