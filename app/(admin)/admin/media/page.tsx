'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, Upload, Trash2, Tag } from 'lucide-react';
import { useAdminRole } from '@/hooks/use-admin-role';
import { RoleBanner } from '@/components/admin/role-banner';

interface MockMedia {
  id: string;
  name: string;
  url: string;
  tags: string[];
  size: string;
}

const initialMedia: MockMedia[] = [
  {
    id: 'm_1',
    name: 'nbac-hangar-display-2025.jpg',
    url: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=300&auto=format&fit=crop',
    tags: ['Aircraft Display', 'Day 1'],
    size: '1.2 MB'
  },
  {
    id: 'm_2',
    name: 'panel-sustainability-aviation.jpg',
    url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=300&auto=format&fit=crop',
    tags: ['Keynote', 'Day 2'],
    size: '840 KB'
  },
  {
    id: 'm_3',
    name: 'opening-ceremony-delegates.jpg',
    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=300&auto=format&fit=crop',
    tags: ['Opening Ceremony'],
    size: '1.5 MB'
  }
];

export default function MediaGalleryPage() {
  const { isHeadAdmin } = useAdminRole();
  const [mediaItems, setMediaItems] = useState<MockMedia[]>(initialMedia);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete "${name}" from storage?`)) {
      setMediaItems(mediaItems.filter(item => item.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <RoleBanner />

      {/* Header */}
      <div>
        <span className="font-sans text-xs uppercase tracking-widest font-semibold text-nbac-gold-light">
          Conference Assets Control
        </span>
        <h2 className="font-display text-2xl font-bold text-nbac-text mt-1">
          Media Gallery Updater
        </h2>
      </div>

      {/* Drag & Drop Upload Zone (Mockup) */}
      <div 
        onClick={() => alert('Drag & Drop / File upload triggered (mocked UI)')}
        className="border-2 border-dashed border-nbac-border hover:border-nbac-gold/30 rounded-xl p-8 bg-[#0b0f10]/30 hover:bg-[#0b0f10]/60 text-center transition-all duration-300 cursor-pointer select-none group"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-nbac-panel border border-nbac-border flex items-center justify-center text-nbac-muted group-hover:text-nbac-gold transition-colors">
            <Upload size={18} />
          </div>
          <div className="space-y-1">
            <p className="font-sans text-sm font-semibold text-nbac-text">
              Select or Drop New Assets
            </p>
            <p className="font-sans text-xs text-nbac-muted font-light">
              Supports PNG, JPG, or PDF (Max 5MB each). Automatically optimized for storage.
            </p>
          </div>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {mediaItems.map((item) => (
          <div 
            key={item.id}
            className="bg-nbac-panel border border-nbac-border rounded-lg overflow-hidden group select-none relative"
          >
            {/* Image display */}
            <div className="relative aspect-video w-full bg-[#070b0c] overflow-hidden">
              {/* Fallback pattern while loading */}
              <div className="absolute inset-0 flex items-center justify-center text-nbac-border">
                <ImageIcon size={32} />
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={item.url} 
                alt={item.name} 
                className="w-full h-full object-cover relative z-10 transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Details Panel */}
            <div className="p-4 space-y-3 relative z-20 bg-nbac-panel">
              <div className="min-w-0">
                <p className="font-sans text-xs font-semibold text-nbac-text truncate" title={item.name}>
                  {item.name}
                </p>
                <p className="font-sans text-[10px] text-nbac-muted mt-0.5 font-light">
                  Size: {item.size}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {item.tags.map((tag, i) => (
                  <span 
                    key={i} 
                    className="bg-nbac-canvas border border-nbac-border text-nbac-body text-[9px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1"
                  >
                    <Tag size={8} className="text-nbac-gold" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>

              {/* Delete Overlay Actions */}
              {isHeadAdmin && (
                <div className="pt-2 border-t border-nbac-border flex justify-end">
                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    className="text-nbac-danger/80 hover:text-nbac-danger hover:bg-nbac-danger/10 border border-nbac-border hover:border-nbac-danger/35 p-1.5 rounded-lg transition-colors cursor-pointer"
                    title="Delete asset"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
