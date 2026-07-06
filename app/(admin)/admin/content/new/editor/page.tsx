'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { EditorPageShell } from '@/components/admin/content/editor-page-shell';
import type { PostTemplate } from '@/types';

function EditorContent() {
  const searchParams = useSearchParams();
  const templateParam = searchParams.get('template') || 'blank';
  
  // Cast templateParam safely to PostTemplate type
  const template = ['announcement', 'press_release', 'sponsor_update', 'event_copy', 'blank'].includes(templateParam)
    ? (templateParam as PostTemplate)
    : 'blank';

  return <EditorPageShell mode="create" template={template} />;
}

export default function NewPostEditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-nbac-canvas text-nbac-text flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-nbac-emerald border-t-transparent animate-spin" />
        <span className="font-sans text-xs uppercase tracking-widest font-semibold text-nbac-muted">
          Loading workspace...
        </span>
      </div>
    }>
      <EditorContent />
    </Suspense>
  );
}
