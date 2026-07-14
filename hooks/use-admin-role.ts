'use client';

import { useState, useEffect } from 'react';
import { AdminRole } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

export function useAdminRole() {
  const [role, setRoleState] = useState<AdminRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supabase = createClient();
      let active = true;

      // In UI development mode, allow toggling the role using a query param (e.g. ?role=editor)
      if (process.env.NODE_ENV !== 'production') {
        const params = new URLSearchParams(window.location.search);
        const roleParam = params.get('role');
        if (roleParam === 'editor' || roleParam === 'head_admin') {
          localStorage.setItem('nbac_admin_role', roleParam);
          const isSecure = window.location.protocol === 'https:' || (process.env.NODE_ENV as string) === 'production';
          document.cookie = `nbac_session=${roleParam}; path=/; max-age=3600; SameSite=Strict${isSecure ? '; Secure' : ''}`;
        }
      }

      async function checkUser() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!active) return;

        let targetRole: AdminRole | null = null;
        if (user) {
          const userRole = user.app_metadata?.role;
          if (userRole === 'head_admin' || userRole === 'editor') {
            targetRole = userRole as AdminRole;
          }
        }

        // In non-production, fallback to localStorage if no server session is found
        if (!targetRole && process.env.NODE_ENV !== 'production') {
          const storedRole = localStorage.getItem('nbac_admin_role');
          if (storedRole === 'editor' || storedRole === 'head_admin') {
            targetRole = storedRole as AdminRole;
          }
        }

        setRoleState(targetRole);
        setLoading(false);
      }

      checkUser();

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
        if (!active) return;
        let targetRole: AdminRole | null = null;
        if (session?.user) {
          const userRole = session.user.app_metadata?.role;
          if (userRole === 'head_admin' || userRole === 'editor') {
            targetRole = userRole as AdminRole;
          }
        }

        if (!targetRole && process.env.NODE_ENV !== 'production') {
          const storedRole = localStorage.getItem('nbac_admin_role');
          if (storedRole === 'editor' || storedRole === 'head_admin') {
            targetRole = storedRole as AdminRole;
          }
        }

        setRoleState(targetRole);
        setLoading(false);
      });

      return () => {
        active = false;
        subscription.unsubscribe();
      };
    }
  }, []);

  return {
    role,
    isAdmin: role === 'head_admin' || role === 'editor',
    isHeadAdmin: role === 'head_admin',
    loading,
    setRole: (newRole: AdminRole | null) => {
      setRoleState(newRole);
      if (typeof window !== 'undefined') {
        if (newRole) {
          localStorage.setItem('nbac_admin_role', newRole);
          const isSecure = window.location.protocol === 'https:' || (process.env.NODE_ENV as string) === 'production';
          document.cookie = `nbac_session=${newRole}; path=/; max-age=3600; SameSite=Strict${isSecure ? '; Secure' : ''}`;
        } else {
          localStorage.removeItem('nbac_admin_role');
          document.cookie = `nbac_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        }
      }
    }
  };
}
