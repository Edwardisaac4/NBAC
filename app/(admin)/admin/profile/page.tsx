'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Shield, Mail, Save, BadgeCheck, Camera, Briefcase, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/shared/toast';

const DEPARTMENTS = [
  'Marketing & Communications',
  'Business Intelligence & IT',
  'Project Management Office'
];

export default function ProfilePage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  // Profile state
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>('editor');
  const [fullName, setFullName] = useState('');
  const [jobTitle, setFullNameJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      try {
        const supabase = createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          toast.error('Session Expired', { description: 'Please sign in again to access your profile.' });
          return;
        }

        if (active) {
          setUserId(user.id);
          setEmail(user.email || '');
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (active) {
          const userRole = data?.role || user.app_metadata?.role || 'editor';
          setRole(userRole);
          
          if (data && !error) {
            setFullName(data.full_name || '');
            setFullNameJobTitle(data.job_title || '');
            setDepartment(data.department || DEPARTMENTS[0]);
            setAvatarUrl(data.avatar_url || '');
          } else {
            setFullName(user.email?.split('@')[0] || '');
            setDepartment(DEPARTMENTS[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load profile details:', err);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      active = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid File', { description: 'Please upload a JPEG, PNG, or WebP image.' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File Too Large', { description: 'Avatar must be under 2MB.' });
      return;
    }

    setAvatarUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop();
      const storagePath = `avatars/${userId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        toast.error('Upload Failed', { description: uploadError.message });
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(storagePath);

      const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`;

      const { error: dbError } = await supabase
        .from('profiles')
        .update({
          avatar_url: urlWithCacheBust,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (dbError) {
        toast.error('Save Failed', { description: dbError.message });
        return;
      }

      setAvatarUrl(urlWithCacheBust);
      window.dispatchEvent(new Event('profile-update'));
      toast.success('Avatar Updated', { description: 'Your profile picture has been changed.' });
    } catch (err: unknown) {
      toast.error('An unexpected error occurred.', { description: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Validation Error', { description: 'Full Name is required.' });
      return;
    }

    setProfileSaving(true);
    try {
      const supabase = createClient();

      // 1. Update basic profile info in the database (excluding role) using UPDATE
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          job_title: jobTitle,
          department: department,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        toast.error('Save Failed', { description: error.message });
        setProfileSaving(false);
        return;
      }

      toast.success('Profile Updated', { description: 'Your profile details have been saved successfully.' });
      window.dispatchEvent(new Event('profile-update'));
    } catch (err: unknown) {
      toast.error('An unexpected error occurred.', { description: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setProfileSaving(false);
    }
  };

  const initials = fullName
    ? fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-nbac-panel/40 border border-nbac-border rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 h-96 bg-nbac-panel/40 border border-nbac-border rounded-xl animate-pulse" />
          <div className="lg:col-span-2 h-56 bg-nbac-panel/40 border border-nbac-border rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="font-display text-3xl font-bold tracking-tight text-nbac-text">
          My Administrator Profile
        </h2>
        <p className="font-sans text-sm text-nbac-muted mt-1 font-light">
          Manage your credentials, operational role, and team details.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Profile details form (3/5 width) */}
        <div className="lg:col-span-3 bg-nbac-panel border border-nbac-border rounded-xl p-6 md:p-8 shadow-xl">
          {/* Avatar + Header section */}
          <div className="flex items-start gap-5 border-b border-nbac-border pb-6 mb-6">
            {/* Avatar with upload overlay */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 rounded-full border-2 border-nbac-border overflow-hidden bg-[#0b0f10] shadow-lg group-hover:border-nbac-gold/40 transition-colors duration-300">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Profile avatar"
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-nbac-emerald/20 to-nbac-gold/10 text-nbac-gold font-display text-xl font-bold">
                    {initials}
                  </div>
                )}
              </div>
              {/* Upload overlay */}
              <button
                type="button"
                disabled={avatarUploading}
                onClick={() => avatarInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer"
              >
                {avatarUploading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <Camera size={18} className="text-white" />
                )}
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              {/* Online indicator */}
              <div className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-nbac-emerald rounded-full border-2 border-nbac-panel" />
            </div>

            <div className="flex-1 min-w-0 pt-1">
              <h3 className="font-sans text-base font-semibold text-nbac-text truncate">
                {fullName || 'Set Your Name'}
              </h3>
              <p className="font-sans text-xs text-nbac-muted font-light mt-0.5 capitalize">
                {jobTitle || `${role.replace('_', ' ')}`}
              </p>
              <p className="font-sans text-[10px] text-nbac-muted/60 mt-1.5 uppercase tracking-widest">
                Hover avatar to change photo
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="font-sans text-xs uppercase tracking-widest font-semibold text-nbac-muted block">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Adesoji Gbadeyan"
                className="w-full bg-[#0b0f10]/60 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text placeholder:text-nbac-muted font-sans text-sm focus:outline-none focus:border-nbac-gold focus:ring-1 focus:ring-nbac-gold transition-colors duration-200"
              />
            </div>

            {/* Job Title */}
            <div className="space-y-2">
              <label className="font-sans text-xs uppercase tracking-widest font-semibold text-nbac-muted block">
                Job Title
              </label>
              <div className="relative">
                <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-nbac-muted pointer-events-none" />
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setFullNameJobTitle(e.target.value)}
                  placeholder="e.g. Chief Operating Officer"
                  className="w-full bg-[#0b0f10]/60 border border-nbac-border rounded-lg pl-11 pr-4 py-3 text-nbac-text placeholder:text-nbac-muted font-sans text-sm focus:outline-none focus:border-nbac-gold focus:ring-1 focus:ring-nbac-gold transition-colors duration-200"
                />
              </div>
            </div>



            {/* Department */}
            <div className="space-y-2">
              <label className="font-sans text-xs uppercase tracking-widest font-semibold text-nbac-muted block">
                Operational Department
              </label>
              <div className="relative">
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-[#0b0f10]/60 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text font-sans text-sm focus:outline-none focus:border-nbac-gold focus:ring-1 focus:ring-nbac-gold transition-colors duration-200 appearance-none cursor-pointer"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept} className="bg-[#0b0f10] text-nbac-text">
                      {dept}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-nbac-muted">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={profileSaving}
              className="flex items-center justify-center gap-2 bg-linear-to-r from-nbac-gold via-nbac-gold-light to-nbac-gold text-[#0b0f10] font-sans font-bold px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-nbac-gold/10 transition-all duration-300 text-sm cursor-pointer disabled:opacity-50"
            >
              <Save size={16} />
              {profileSaving ? 'Saving changes...' : 'Save Profile Details'}
            </button>
          </form>
        </div>

        {/* Sidebar Card (2/5 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account info card */}
          <div className="bg-nbac-panel border border-nbac-border rounded-xl p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-3 border-b border-nbac-border pb-4">
              <div className="p-2 rounded-lg bg-nbac-gold/10 text-nbac-gold border border-nbac-gold/20">
                <BadgeCheck size={20} />
              </div>
              <div>
                <h3 className="font-sans text-base font-semibold text-nbac-text">Account Attributes</h3>
                <p className="font-sans text-xs text-nbac-muted font-light">System clearance & email configuration.</p>
              </div>
            </div>

            <div className="space-y-4 font-sans">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest font-semibold text-nbac-muted block">Registered Email</span>
                <div className="flex items-center gap-2 text-sm text-nbac-text bg-[#0b0f10]/30 border border-nbac-border/40 rounded-lg p-2.5">
                  <Mail size={14} className="text-nbac-muted" />
                  <span className="truncate">{email}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest font-semibold text-nbac-muted block">Security Access Clearance</span>
                <div className="flex items-center gap-2 text-sm text-nbac-text bg-[#0b0f10]/30 border border-nbac-border/40 rounded-lg p-2.5">
                  <Shield size={14} className="text-nbac-gold" />
                  <span className="capitalize">{role.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
