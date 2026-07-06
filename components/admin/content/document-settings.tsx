'use client';

import React, { useState } from 'react';
import { Upload, X, Lock, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PostTemplate, PostVisibility } from '@/types';
import { useAdminRole } from '@/hooks/use-admin-role';
import { AlertDialog } from '@/components/shared/alert-dialog';

interface DocumentSettingsProps {
  authorName: string;
  onAuthorNameChange: (name: string) => void;
  category: PostTemplate;
  onCategoryChange: (category: PostTemplate) => void;
  coverImageUrl?: string;
  onCoverImageUrlChange: (url: string) => void;
  visibility: PostVisibility;
  onVisibilityChange: (visibility: PostVisibility) => void;
  isEditMode: boolean;
  onDelete?: () => void;
}

const PRESET_IMAGES = [
  { name: 'Private Jet Tarmac', url: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=600&auto=format&fit=crop' },
  { name: 'VIP Conference Panel', url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=600&auto=format&fit=crop' },
  { name: 'Delegate Networking', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=600&auto=format&fit=crop' },
  { name: 'Business Aviation Lounge', url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=600&auto=format&fit=crop' },
  { name: 'Executive Meeting Room', url: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=600&auto=format&fit=crop' }
];

export function DocumentSettings({
  authorName,
  onAuthorNameChange,
  category,
  onCategoryChange,
  coverImageUrl,
  onCoverImageUrlChange,
  visibility,
  onVisibilityChange,
  isEditMode,
  onDelete,
}: DocumentSettingsProps) {
  const { isHeadAdmin } = useAdminRole();
  const [activeCoverTab, setActiveCoverTab] = useState<'gallery' | 'link' | 'upload'>('gallery');
  const [urlInput, setUrlInput] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // File upload simulation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onCoverImageUrlChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onCoverImageUrlChange(urlInput.trim());
      setUrlInput('');
    }
  };

  return (
    <div className="w-full lg:w-80 shrink-0 border-l border-nbac-border bg-nbac-canvas p-6 space-y-8 select-none font-sans overflow-y-auto lg:h-[calc(100vh-4rem)] sticky top-16">
      <div>
        <h3 className="text-white font-semibold text-lg">Post Settings</h3>
        <p className="text-nbac-muted text-xs mt-1">
          These details control how your post appears.
        </p>
      </div>

      {/* SECTION: WRITTEN BY */}
      <div className="space-y-2.5 pt-4 border-t border-nbac-border/40">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-nbac-muted">
          Written By
        </label>
        <input
          type="text"
          value={authorName}
          onChange={(e) => onAuthorNameChange(e.target.value)}
          placeholder="Author name..."
          className="w-full bg-nbac-panel border border-nbac-border rounded-lg px-3 py-2 text-white placeholder:text-nbac-muted text-xs focus:outline-none focus:border-nbac-emerald transition-colors"
        />
      </div>

      {/* SECTION: CATEGORY */}
      <div className="space-y-2.5 pt-4 border-t border-nbac-border/40">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-nbac-muted">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value as PostTemplate)}
          className="w-full bg-nbac-panel border border-nbac-border rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-nbac-emerald transition-colors cursor-pointer"
        >
          <option value="announcement">Announcement</option>
          <option value="press_release">Press Release</option>
          <option value="sponsor_update">Sponsor Update</option>
          <option value="event_copy">Event Copy</option>
          <option value="blank">General</option>
        </select>
      </div>

      {/* SECTION: COVER IMAGE */}
      <div className="space-y-3 pt-4 border-t border-nbac-border/40">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-nbac-muted">
          Cover Image
        </label>

        {coverImageUrl ? (
          <div className="relative rounded-lg overflow-hidden border border-nbac-border bg-nbac-panel group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImageUrl}
              alt="Cover preview"
              className="h-28 w-full object-cover"
            />
            <button
              type="button"
              onClick={() => onCoverImageUrlChange('')}
              className="absolute top-2 right-2 p-1 rounded-full bg-black/70 text-nbac-muted hover:text-white transition-colors cursor-pointer"
              title="Remove cover image"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-nbac-panel/40 border border-nbac-border rounded-lg p-0.5 text-[10px] font-medium text-center">
              <button
                type="button"
                onClick={() => setActiveCoverTab('gallery')}
                className={cn(
                  'py-1.5 rounded transition-all cursor-pointer',
                  activeCoverTab === 'gallery'
                    ? 'bg-nbac-panel text-white shadow-sm'
                    : 'text-nbac-muted hover:text-white'
                )}
              >
                Gallery
              </button>
              <button
                type="button"
                onClick={() => setActiveCoverTab('link')}
                className={cn(
                  'py-1.5 rounded transition-all cursor-pointer',
                  activeCoverTab === 'link'
                    ? 'bg-nbac-panel text-white shadow-sm'
                    : 'text-nbac-muted hover:text-white'
                )}
              >
                Link
              </button>
              <button
                type="button"
                onClick={() => setActiveCoverTab('upload')}
                className={cn(
                  'py-1.5 rounded transition-all cursor-pointer',
                  activeCoverTab === 'upload'
                    ? 'bg-nbac-panel text-white shadow-sm'
                    : 'text-nbac-muted hover:text-white'
                )}
              >
                Upload
              </button>
            </div>

            {/* Tab Contents */}
            {activeCoverTab === 'gallery' && (
              <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {PRESET_IMAGES.map((img) => (
                  <div
                    key={img.url}
                    onClick={() => onCoverImageUrlChange(img.url)}
                    className="relative h-14 rounded overflow-hidden border border-nbac-border cursor-pointer hover:border-nbac-emerald/55 transition-all group bg-nbac-panel"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[9px] text-white font-medium">Select</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeCoverTab === 'link' && (
              <form onSubmit={handleLinkSubmit} className="flex gap-1.5">
                <input
                  type="url"
                  placeholder="Paste image link..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 bg-nbac-panel border border-nbac-border rounded-lg px-2.5 py-1.5 text-white placeholder:text-nbac-muted text-xs focus:outline-none focus:border-nbac-emerald transition-colors"
                />
                <button
                  type="submit"
                  className="bg-nbac-emerald hover:bg-nbac-emerald-dark text-white rounded-lg px-2.5 text-xs transition-colors cursor-pointer"
                >
                  Add
                </button>
              </form>
            )}

            {activeCoverTab === 'upload' && (
              <label className="flex flex-col items-center justify-center h-20 border border-dashed border-nbac-border hover:border-nbac-emerald/50 rounded-lg cursor-pointer bg-nbac-panel/20 hover:bg-nbac-panel/30 transition-all select-none">
                <Upload size={16} className="text-nbac-muted mb-1" />
                <span className="text-[10px] text-nbac-muted">
                  Drag & drop or <span className="text-nbac-emerald-light font-medium">browse</span>
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        )}
      </div>

      {/* SECTION: VISIBILITY */}
      <div className="space-y-3 pt-4 border-t border-nbac-border/40">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-nbac-muted">
          Visibility
        </label>

        <div className="grid grid-cols-2 gap-2">
          {/* Draft Toggle Button */}
          <button
            type="button"
            onClick={() => onVisibilityChange('draft')}
            className={cn(
              'border rounded-lg p-3 text-left transition-all duration-300 cursor-pointer flex flex-col gap-1',
              visibility === 'draft'
                ? 'border-nbac-emerald bg-nbac-emerald/5 shadow-[0_0_12px_rgba(16,185,129,0.05)]'
                : 'border-nbac-border bg-nbac-panel hover:border-nbac-border/80'
            )}
          >
            <Lock size={14} className={visibility === 'draft' ? 'text-nbac-emerald' : 'text-nbac-muted'} />
            <span className="text-xs font-semibold text-white mt-1">Draft</span>
            <span className="text-[9px] text-nbac-muted leading-tight font-light">Only admins can see it</span>
          </button>

          {/* Public Toggle Button */}
          <button
            type="button"
            onClick={() => onVisibilityChange('published')}
            className={cn(
              'border rounded-lg p-3 text-left transition-all duration-300 cursor-pointer flex flex-col gap-1',
              visibility === 'published'
                ? 'border-nbac-emerald bg-nbac-emerald/5 shadow-[0_0_12px_rgba(16,185,129,0.05)]'
                : 'border-nbac-border bg-nbac-panel hover:border-nbac-border/80'
            )}
          >
            <Globe size={14} className={visibility === 'published' ? 'text-nbac-emerald' : 'text-nbac-muted'} />
            <span className="text-xs font-semibold text-white mt-1">Public</span>
            <span className="text-[9px] text-nbac-muted leading-tight font-light">Everyone can see it</span>
          </button>
        </div>
      </div>

      {/* SECTION: DANGER ZONE (edit mode only) */}
      {isEditMode && onDelete && isHeadAdmin && (
        <div className="pt-6 border-t border-nbac-danger/20 space-y-3">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-nbac-danger">
            Danger Zone
          </label>
          <button
            type="button"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="w-full border border-nbac-danger/30 hover:border-nbac-danger hover:bg-nbac-danger/10 text-nbac-danger font-sans text-xs font-medium py-2.5 rounded-full transition-all duration-300 cursor-pointer"
          >
            Delete this post
          </button>

          <AlertDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={onDelete}
            title="Permanently Delete Post?"
            description="Are you sure? This post will be permanently deleted and cannot be recovered."
            confirmText="Delete Post"
            cancelText="Cancel"
          />
        </div>
      )}
    </div>
  );
}
