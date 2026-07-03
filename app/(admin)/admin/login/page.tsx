'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, KeyRound } from 'lucide-react';
import { useAdminRole } from '@/hooks/use-admin-role';

export default function AdminLoginPage() {
  const router = useRouter();
  const { setRole } = useAdminRole();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent, roleType?: 'head_admin' | 'editor') => {
    e.preventDefault();

    if (roleType && process.env.NODE_ENV === 'production') {
      alert('Developer Demo Mode is disabled in production.');
      return;
    }

    setIsLoading(true);

    // Simulate authenticating
    setTimeout(() => {
      if (roleType) {
        setRole(roleType);
        setIsLoading(false);
        router.push('/admin');
      } else {
        // Strict mock check for admin credentials
        if (email === 'admin@nbac.com.ng' && password === 'admin123') {
          setRole('head_admin');
          setIsLoading(false);
          router.push('/admin');
        } else if (email === 'editor@nbac.com.ng' && password === 'editor123') {
          setRole('editor');
          setIsLoading(false);
          router.push('/admin');
        } else {
          setIsLoading(false);
          alert('Access Denied: Invalid email or security key.');
        }
      }
    }, 800);
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
            className="w-full bg-gradient-to-r from-nbac-emerald to-nbac-emerald-dark hover:from-nbac-emerald-dark hover:to-nbac-emerald-dark text-white font-sans font-medium py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-nbac-emerald/10 text-sm mt-2 flex items-center justify-center gap-2 cursor-pointer"
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
