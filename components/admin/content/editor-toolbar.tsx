'use client';

import React, { useRef } from 'react';
import { type Editor } from '@tiptap/react';
import { Image as ImageIcon, List, ListOrdered, RemoveFormatting } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!editor) return null;

  // Resizes image maintaining aspect ratio and compresses to JPEG
  const resizeAndCompressImage = (file: File, maxWidth = 1200, maxHeight = 1200): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get 2D canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 80% quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(compressedDataUrl);
        };
        img.onerror = () => reject(new Error('Failed to load image file'));
        if (typeof e.target?.result === 'string') {
          img.src = e.target.result;
        } else {
          reject(new Error('Failed to read image as data URL'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const resizedDataUrl = await resizeAndCompressImage(file);
        editor.chain().focus().setImage({ src: resizedDataUrl }).run();
      } catch (err) {
        console.error('Failed to resize and compress image', err);
        // Fallback: load as-is if compression fails
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            editor.chain().focus().setImage({ src: reader.result }).run();
          }
        };
        reader.readAsDataURL(file);
      }
      // Reset input value so selection of same file triggers change event again
      e.target.value = '';
    }
  };

  return (
    <div className="flex items-center gap-1.5 border-b border-nbac-border bg-nbac-canvas py-2.5 px-4 select-none">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Image button */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium font-sans text-nbac-body hover:bg-nbac-panel hover:text-white rounded transition-colors cursor-pointer"
        title="Insert Image (Upload)"
      >
        <ImageIcon size={14} className="text-nbac-emerald-light" />
        <span>Image</span>
      </button>

      <div className="h-4 w-px bg-nbac-border mx-1" />

      {/* Bullet List button */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium font-sans rounded transition-all cursor-pointer',
          editor.isActive('bulletList')
            ? 'bg-nbac-emerald text-white'
            : 'text-nbac-body hover:bg-nbac-panel hover:text-white'
        )}
        title="Bullet List"
      >
        <List size={14} />
        <span>Bullet List</span>
      </button>

      {/* Numbered List button */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium font-sans rounded transition-all cursor-pointer',
          editor.isActive('orderedList')
            ? 'bg-nbac-emerald text-white'
            : 'text-nbac-body hover:bg-nbac-panel hover:text-white'
        )}
        title="Numbered List"
      >
        <ListOrdered size={14} />
        <span>Numbered List</span>
      </button>

      <div className="h-4 w-px bg-nbac-border mx-1" />

      {/* Clear Formatting button */}
      <button
        type="button"
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium font-sans text-nbac-body hover:bg-nbac-panel hover:text-nbac-danger rounded transition-colors cursor-pointer"
        title="Clear Formatting"
      >
        <RemoveFormatting size={14} />
        <span>Clear Formatting</span>
      </button>
    </div>
  );
}
