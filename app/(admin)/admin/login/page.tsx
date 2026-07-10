'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, KeyRound } from 'lucide-react';
import { useAdminRole } from '@/hooks/use-admin-role';
import { createClient } from '@/lib/supabase/client';
import { logAdminActivity } from '@/lib/blog-data';
import { useToast } from '@/components/shared/toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const { setRole } = useAdminRole();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent, roleType?: 'head_admin' | 'editor') => {
    e.preventDefault();

    if (roleType && process.env.NODE_ENV === 'production') {
      toast.info('Developer Demo Mode is disabled in production.');
      return;
    }

    setIsLoading(true);

    if (roleType) {
      try {
        const demoEmail = roleType === 'head_admin' 
          ? 'adesoji.gbadeyan@ean.aero' 
          : 'josephine.kolawole@ean.aero';
        const demoPassword = roleType === 'head_admin' 
          ? 'NbacAdmin2026!' 
          : 'MarketingNbac2027!';
          
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: demoEmail,
          password: demoPassword,
        });

        if (error) {
          console.warn('Demo auth fallback failed, using simulated bypass:', error.message);
          setRole(roleType);
          setIsLoading(false);
          router.push('/admin');
          return;
        }

        const userRole = data.user?.app_metadata?.role;
        setRole(userRole || roleType);
        await logAdminActivity('login', `Administrator logged in (Demo Mode via Supabase Auth): ${demoEmail}`);
        setIsLoading(false);
        router.push('/admin');
      } catch (err) {
        console.error('Demo auth failed:', err);
        setRole(roleType);
        setIsLoading(false);
        router.push('/admin');
      }
    } else {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setIsLoading(false);
          toast.error('Access Denied', { description: error.message });
          return;
        }

        const userRole = data.user?.app_metadata?.role;
        if (userRole === 'head_admin' || userRole === 'editor') {
          setRole(userRole);
          await logAdminActivity('login', `Administrator logged in: ${data.user?.email}`);
          setIsLoading(false);
          router.push('/admin');
        } else {
          setIsLoading(false);
          toast.error('Access Denied', { description: 'Authorized role not found on user profile.' });
          await supabase.auth.signOut();
        }
      } catch {
        setIsLoading(false);
        toast.error('An unexpected error occurred during login.');
      }
    }
  };

  return (
    <div className="w-full max-w-md px-6 py-12 select-none">
      {/* Brand Icon Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-nbac-panel border border-nbac-gold/20 flex items-center justify-center text-nbac-gold shadow-lg shadow-nbac-gold/5 mb-4">
          <Shield size={28} />
        </div>
        <h2 className="font-display text-3xl font-bold tracking-tight text-nbac-text text-center">
          NBAC Executive Portal
        </h2>
        <p className="font-sans text-sm text-nbac-muted text-center mt-2 font-light">
          Sign in to access the control board and intake vault.
        </p>
      </div>

      {/* Glassmorphism Card Form */}
      <div className="bg-nbac-panel border border-nbac-border rounded-xl p-8 shadow-xl">
        <form onSubmit={(e) => handleLogin(e)} className="space-y-5">
          {/* Email input */}
          <div className="space-y-2">
            <label className="font-sans text-xs uppercase tracking-widest font-semibold text-nbac-muted">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nbac.com.ng"
                className="w-full bg-[#0b0f10]/60 border border-nbac-border rounded-lg pl-10 pr-4 py-3 text-nbac-text placeholder:text-nbac-muted font-sans text-sm focus:outline-none focus:border-nbac-gold focus:ring-1 focus:ring-nbac-gold transition-colors duration-200"
              />
              <Mail className="absolute left-3.5 top-3.5 text-nbac-muted" size={16} />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-2">
            <label className="font-sans text-xs uppercase tracking-widest font-semibold text-nbac-muted">
              Security Key / Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0b0f10]/60 border border-nbac-border rounded-lg pl-10 pr-4 py-3 text-nbac-text placeholder:text-nbac-muted font-sans text-sm focus:outline-none focus:border-nbac-gold focus:ring-1 focus:ring-nbac-gold transition-colors duration-200"
              />
              <KeyRound className="absolute left-3.5 top-3.5 text-nbac-muted" size={16} />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-linear-to-r from-nbac-gold via-nbac-gold-light to-nbac-gold text-[#0b0f10] font-sans font-bold py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-nbac-gold/10 text-sm mt-2 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? 'Decrypting credentials...' : 'Enter Admin Control Board'}
          </button>
        </form>

        {/* Demo Roles Quick-Selector */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="mt-8 pt-6 border-t border-nbac-border">
            <p className="font-sans text-[10px] uppercase tracking-wider font-semibold text-nbac-muted text-center mb-3">
              Developer Demo Mode — Click to bypass & set role:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={(e) => handleLogin(e, 'head_admin')}
                className="bg-nbac-gold/10 hover:bg-nbac-gold/20 border border-nbac-gold/30 text-nbac-gold-light font-sans font-semibold text-xs py-2.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Shield size={12} />
                <span>Head Admin</span>
              </button>
              <button
                onClick={(e) => handleLogin(e, 'editor')}
                className="bg-nbac-panel hover:bg-nbac-border border border-nbac-border text-nbac-text font-sans font-semibold text-xs py-2.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Lock size={12} />
                <span>Editor / Staff</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
