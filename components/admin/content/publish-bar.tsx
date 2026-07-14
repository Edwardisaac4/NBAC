'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, AlertCircle, Loader2, Globe, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PostTemplate, PostVisibility } from '@/types';

interface PublishBarProps {
  template: PostTemplate;
  status: PostVisibility;
  onStatusChange: (status: PostVisibility) => void;
  isPublishedInDb: boolean;
  saveStatus: 'saved' | 'unsaved' | 'saving';
  onSave: () => void;
  onPublish: () => void;
  isEditMode?: boolean;
}

const TEMPLATE_LABELS: Record<PostTemplate, string> = {
  announcement: 'Announcement',
  press_release: 'Press Release',
  sponsor_update: 'Sponsor Update',
  event_copy: 'Event Copy',
  blank: 'Start from Scratch',
};

export function PublishBar({
  template,
  status,
  onStatusChange,
  isPublishedInDb,
  saveStatus,
  onSave,
  onPublish,
  isEditMode = false,
}: PublishBarProps) {
  const templateName = TEMPLATE_LABELS[template] || 'Post';

  const toggleStatus = () => {
    onStatusChange(status === 'draft' ? 'published' : 'draft');
  };

  return (
    <div className="sticky top-0 z-30 h-16 border-b border-nbac-border bg-nbac-canvas/90 backdrop-blur-md px-6 flex items-center justify-between shrink-0 select-none">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/content"
          className="group flex items-center gap-2 font-sans text-xs text-nbac-muted hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Posts</span>
        </Link>
        
        <div className="h-4 w-px bg-nbac-border" />
 
        <span className="bg-nbac-emerald/10 text-nbac-emerald-light text-xs font-medium px-3 py-1 rounded-full border border-nbac-emerald/20">
          {templateName}
        </span>
      </div>

      {/* Center - Auto-save indicator */}
      <div className="flex items-center justify-center">
        {saveStatus === 'saved' && (
          <span className="flex items-center gap-1.5 font-sans text-xs text-nbac-muted">
            <Check size={12} className="text-nbac-emerald" />
            <span>Saved</span>
          </span>
        )}
        {saveStatus === 'unsaved' && (
          <span className="flex items-center gap-1.5 font-sans text-xs text-nbac-amber">
            <AlertCircle size={12} />
            <span>Unsaved changes</span>
          </span>
        )}
        {saveStatus === 'saving' && (
          <span className="flex items-center gap-1.5 font-sans text-xs text-nbac-muted animate-pulse">
            <Loader2 size={12} className="animate-spin text-nbac-emerald" />
            <span>Saving...</span>
          </span>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Toggleable Status Pill */}
        <button
          type="button"
          onClick={toggleStatus}
          className={cn(
            'px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 transition-all duration-300 border cursor-pointer select-none',
            status === 'published'
              ? 'bg-nbac-emerald/15 text-nbac-emerald border-nbac-emerald/30 shadow-[0_0_12px_rgba(16,185,129,0.1)]'
              : 'bg-transparent text-nbac-amber border-nbac-amber/40 hover:bg-nbac-amber/5'
          )}
          title="Click to toggle status"
        >
          {status === 'published' ? (
            <>
              <Globe size={11} />
              <span>Published</span>
            </>
          ) : (
            <>
              <FileText size={11} />
              <span>Draft</span>
            </>
          )}
        </button>

        <div className="h-4 w-px bg-nbac-border" />

        {/* Save Draft / Switch to Draft Action */}
        <button
          type="button"
          onClick={onSave}
          className="border border-nbac-border text-nbac-body hover:bg-nbac-panel hover:text-white font-sans text-xs font-medium px-4 py-2 rounded-full transition-colors cursor-pointer"
        >
          {isPublishedInDb ? 'Switch to Draft' : 'Save Draft'}
        </button>

        {/* Publish Action / Save & Update */}
        <button
          type="button"
          onClick={onPublish}
          className="bg-nbac-emerald hover:bg-nbac-emerald-dark text-white font-sans text-xs font-medium px-5 py-2 rounded-full transition-all duration-300 shadow-md shadow-nbac-emerald/10 hover:scale-[1.01] cursor-pointer"
        >
          {isPublishedInDb ? 'Save & Update' : 'Publish Post'}
        </button>
      </div>
    </div>
  );
}
