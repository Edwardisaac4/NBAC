'use client';

import React, { use } from 'react';
import { EditorPageShell } from '@/components/admin/content/editor-page-shell';

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const resolvedParams = use(params);

  return (
    <div className="min-h-screen bg-nbac-canvas text-nbac-text">
      <EditorPageShell mode="edit" postId={resolvedParams.id} />
    </div>
  );
}
