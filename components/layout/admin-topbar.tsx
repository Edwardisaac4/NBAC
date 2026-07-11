'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { 
  Menu, 
  Bell, 
  Shield, 
  Settings, 
  Check, 
  Trash2, 
  MessageSquare, 
  Award, 
  Ticket, 
  Inbox,
  Loader2,
  Clock
} from 'lucide-react';
import { useAdminRole } from '@/hooks/use-admin-role';
import { useToast } from '@/components/shared/toast';
import { createClient } from '@/lib/supabase/client';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

interface AdminTopbarProps {
  title: string;
  onOpenMobileMenu?: () => void;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${diffDay}d ago`;
}

export function AdminTopbar({ title, onOpenMobileMenu }: AdminTopbarProps) {
  const { isHeadAdmin } = useAdminRole();
  const toast = useToast();
  
  // Notification states
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load notifications from Supabase
  const loadNotifications = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.read).length);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    // Subscribe to realtime postgres changes
    const supabase = createClient();
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newNotif = payload.new as Notification;
            setNotifications(prev => [newNotif, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Trigger a beautiful browser toast notification
            toast.success(newNotif.title, { 
              description: newNotif.message
            });
          } else {
            // Reload list for deletes/updates to keep in sync
            loadNotifications();
          }
        }
      )
      .subscribe();

    // Handle clicks outside of dropdown
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      channel.unsubscribe();
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      const supabase = createClient();
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || markingAll) return;
    setMarkingAll(true);
    try {
      const supabase = createClient();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false);

      if (error) throw error;
      toast.success('Marked all notifications as read');
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleClearAll = async () => {
    if (notifications.length === 0 || clearingAll) return;
    setClearingAll(true);
    try {
      const supabase = createClient();
      setNotifications([]);
      setUnreadCount(0);

      const { error } = await supabase
        .from('notifications')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete everything

      if (error) throw error;
      toast.success('Cleared all notifications');
      setDropdownOpen(false);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    } finally {
      setClearingAll(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'delegate_registration':
        return (
          <div className="p-2 rounded-lg bg-nbac-emerald/10 text-nbac-emerald border border-nbac-emerald/20">
            <Ticket size={16} />
          </div>
        );
      case 'sponsor_application':
        return (
          <div className="p-2 rounded-lg bg-nbac-gold/10 text-nbac-gold border border-nbac-gold/20">
            <Award size={16} />
          </div>
        );
      case 'contact_inquiry':
      default:
        return (
          <div className="p-2 rounded-lg bg-nbac-muted/20 text-nbac-text border border-nbac-border">
            <MessageSquare size={16} />
          </div>
        );
    }
  };

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
        {/* Notifications Panel Dropdown wrapper */}
        <div className="relative" ref={dropdownRef}>
          {/* Notifications Icon Button */}
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`relative p-2 text-nbac-body hover:text-nbac-gold hover:bg-nbac-panel border border-nbac-border rounded-lg bg-nbac-panel/40 transition-all duration-200 cursor-pointer ${dropdownOpen ? 'text-nbac-gold bg-nbac-panel/80' : ''}`}
            aria-label="View notifications"
          >
            <Bell size={18} />
            {/* Notification Indicator Dot with Count */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-nbac-gold px-1 font-sans text-[9px] font-bold text-[#0b0f10] ring-2 ring-nbac-canvas">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#0b0f10]/95 backdrop-blur-xl border border-nbac-border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-200">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-nbac-border bg-[#070b0c]/80">
                <div className="flex items-center gap-2">
                  <span className="font-sans text-sm font-semibold text-nbac-text">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-nbac-gold/10 text-nbac-gold border border-nbac-gold/20 font-sans text-[10px] font-medium">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      disabled={markingAll}
                      className="p-1 text-nbac-muted hover:text-nbac-gold transition-colors cursor-pointer"
                      title="Mark all as read"
                    >
                      {markingAll ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button 
                      onClick={handleClearAll}
                      disabled={clearingAll}
                      className="p-1 text-nbac-muted hover:text-nbac-danger transition-colors cursor-pointer"
                      title="Clear all"
                    >
                      {clearingAll ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                    </button>
                  )}
                </div>
              </div>

              {/* List */}
              <div className="max-h-96 overflow-y-auto divide-y divide-nbac-border/40 scrollbar-thin scrollbar-thumb-nbac-border/40">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-10 text-nbac-muted font-sans text-xs gap-2">
                    <Loader2 className="animate-spin text-nbac-gold" size={16} />
                    <span>Loading alerts feed...</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-nbac-muted font-sans text-xs gap-3 select-none">
                    <div className="p-3 rounded-full bg-nbac-panel border border-nbac-border/50 text-nbac-muted/40">
                      <Inbox size={22} />
                    </div>
                    <span>No notifications received yet</span>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id}
                      onClick={() => !n.read && handleMarkAsRead(n.id)}
                      className={`flex gap-3.5 p-4 transition-colors relative group/item cursor-pointer ${n.read ? 'hover:bg-nbac-panel/30 bg-transparent' : 'bg-nbac-gold/5 hover:bg-nbac-gold/10'}`}
                    >
                      {/* Unread marker bar */}
                      {!n.read && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-nbac-gold" />
                      )}

                      {/* Icon */}
                      <div className="shrink-0">
                        {getNotificationIcon(n.type)}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-sans text-xs font-semibold text-nbac-text leading-tight truncate">
                            {n.title}
                          </p>
                          <span className="font-sans text-[9px] text-nbac-muted shrink-0 flex items-center gap-1 font-light pt-0.5">
                            <Clock size={8} />
                            {formatRelativeTime(n.created_at)}
                          </span>
                        </div>
                        <p className="font-sans text-[11px] text-nbac-muted font-light leading-relaxed break-words">
                          {n.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Settings Icon */}
        <button 
          onClick={() => toast.info('Settings Panel', { description: 'Settings clicked (mocked UI)' })}
          className="p-2 text-nbac-body hover:text-nbac-gold hover:bg-nbac-panel border border-nbac-border rounded-lg bg-nbac-panel/40 transition-all duration-200 cursor-pointer"
          aria-label="Settings"
        >
          <Settings size={18} />
        </button>

        {/* Head Admin Mode / Editor Mode Badge */}
        {isHeadAdmin ? (
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-linear-to-r from-nbac-gold via-nbac-gold-light to-nbac-gold text-[#0b0f10] border border-nbac-gold-light/25 shadow-lg shadow-nbac-gold/15 rounded-full font-sans text-xs font-semibold uppercase tracking-wider select-none animate-pulse-subtle">
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
