import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const INACTIVITY_TIMEOUT = 5 * 60 * 60 * 1000; // 5 hours in milliseconds
const LAST_ACTIVE_KEY = 'nbac_admin_last_active';

export function useInactivityLogout(isAdmin: boolean) {
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin || typeof window === 'undefined') return;

    const supabase = createClient();

    // Initialize last active time if not set
    if (!localStorage.getItem(LAST_ACTIVE_KEY)) {
      localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
    }

    const updateActivity = () => {
      const now = Date.now();
      const lastSaved = parseInt(localStorage.getItem(LAST_ACTIVE_KEY) || '0', 10);
      
      // Throttle writes to localStorage to once every 5 seconds
      if (now - lastSaved > 5000) {
        localStorage.setItem(LAST_ACTIVE_KEY, now.toString());
      }
    };

    const checkInactivity = async () => {
      const lastActive = parseInt(localStorage.getItem(LAST_ACTIVE_KEY) || '0', 10);
      const elapsed = Date.now() - lastActive;

      if (elapsed >= INACTIVITY_TIMEOUT) {
        // Clear tracker
        localStorage.removeItem(LAST_ACTIVE_KEY);
        
        // Log out of Supabase Auth
        await supabase.auth.signOut();
        
        // Redirect to admin login screen
        router.push('/admin/login');
      }
    };

    // Track standard user interaction events
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    events.forEach(event => {
      window.addEventListener(event, updateActivity);
    });

    // Check for inactivity every 30 seconds
    const interval = setInterval(checkInactivity, 30000);

    // Initial check on mount
    checkInactivity();

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
      clearInterval(interval);
    };
  }, [isAdmin, router]);
}
