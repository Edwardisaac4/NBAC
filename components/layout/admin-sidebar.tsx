'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
import { createClient } from '@/lib/supabase/client';
import { logAdminActivity } from '@/lib/blog-data';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, setRole } = useAdminRole();
  const [loggingOut, setLoggingOut] = useState(false);
  const [profile, setProfile] = useState<{ fullName: string; jobTitle: string; department: string; avatarUrl: string } | null>(null);

  useEffect(() => {
    let active = true;
    async function fetchProfile() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user && active) {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name, job_title, department, avatar_url')
            .eq('id', user.id)
            .single();
          
          if (data && !error && active) {
            setProfile({
              fullName: data.full_name || user.email?.split('@')[0] || 'User Profile',
              jobTitle: data.job_title || '',
              department: data.department || 'Aviation Operations',
              avatarUrl: data.avatar_url || ''
            });
          }
        }
      } catch (err) {
        console.error('Error fetching profile for sidebar:', err);
      }
    }

    fetchProfile();

    // Listen to profile updates
    const handleUpdate = () => {
      fetchProfile();
    };
    window.addEventListener('profile-update', handleUpdate);

    return () => {
      active = false;
      window.removeEventListener('profile-update', handleUpdate);
    };
  }, [role]);

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
          <span className="font-display text-2xl font-bold bg-linear-to-r from-nbac-emerald via-nbac-gold to-nbac-gold-light bg-clip-text text-transparent tracking-tight">
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
                <div className="absolute inset-0 bg-linear-to-r from-nbac-gold/5 to-transparent pointer-events-none" />
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
        <Link 
          href="/admin/profile"
          onClick={onClose}
          className="flex items-center gap-3 px-2 py-1.5 -mx-1 hover:bg-nbac-panel/40 border border-transparent hover:border-nbac-border/20 rounded-xl transition-all duration-200 cursor-pointer group/user"
        >
          <div className="w-9 h-9 rounded-full border border-nbac-border shadow-inner group-hover/user:border-nbac-gold/30 transition-colors shrink-0 overflow-hidden bg-nbac-panel">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : profile ? (
              <div className="w-full h-full flex items-center justify-center text-nbac-gold-light font-sans text-xs font-bold">
                {profile.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-nbac-muted">
                <User size={18} />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-sans text-xs font-semibold text-nbac-text truncate group-hover/user:text-nbac-gold-light transition-colors">
              {profile ? profile.fullName : 'User Profile'}
            </p>
            <p className="font-sans text-[10px] text-nbac-muted truncate">
              {profile?.jobTitle || profile?.department || (role ? role.replace('_', ' ') : '')}
            </p>
          </div>
        </Link>

        {/* Logout Button */}
        <button 
          disabled={loggingOut}
          onClick={async () => {
            setLoggingOut(true);
            try {
              await logAdminActivity('logout', `Administrator logged out`);
              const supabase = createClient();
              await supabase.auth.signOut();
              setRole(null);
              router.push('/admin/login');
            } catch (err) {
              console.error('Logout failed:', err);
              setLoggingOut(false);
            }
          }}
          className={cn(
            "flex items-center justify-center gap-2 w-full border border-nbac-border text-nbac-body hover:bg-nbac-panel hover:text-nbac-danger hover:border-nbac-danger/35 font-sans font-medium px-4 py-2 rounded-lg transition-colors text-xs",
            loggingOut && "opacity-50 cursor-not-allowed"
          )}
        >
          <LogOut size={14} className={loggingOut ? 'animate-spin' : ''} />
          <span>{loggingOut ? 'Signing out…' : 'Logout'}</span>
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
