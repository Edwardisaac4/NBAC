'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Link from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import { EDITOR_TEMPLATES } from '@/lib/editor-templates';
import type { PostTemplate } from '@/types';
import { cn } from '@/lib/utils';

interface PostEditorProps {
  template: PostTemplate;
  initialContent?: string;
  onChange: (html: string) => void;
  onEditorCreated?: (editor: Editor) => void;
}

const CustomImage = ImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        renderHTML: (attributes) => {
          return {
            width: attributes.width,
            style: `width: ${attributes.width || '100%'}; max-width: 100%;`,
            class: 'mx-auto block max-w-full h-auto rounded-lg border border-nbac-border my-4',
          };
        },
        parseHTML: (element) => element.getAttribute('width') || '100%',
      },
    };
  },
});

export function PostEditor({ template, initialContent, onChange, onEditorCreated }: PostEditorProps) {
  const starterContent = initialContent ?? EDITOR_TEMPLATES[template]?.body ?? '';

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your post here...',
      }),
      CharacterCount,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-nbac-emerald underline' },
      }),
      CustomImage,
    ],
    content: starterContent,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[400px] font-sans text-nbac-body leading-relaxed py-4',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Notify parent component that editor is ready
  useEffect(() => {
    if (editor && onEditorCreated) {
      onEditorCreated(editor);
    }
  }, [editor, onEditorCreated]);

  // Keep editor content in sync if initialContent changes (e.g. edit mode loaded)
  useEffect(() => {
    if (editor && initialContent !== undefined && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  return (
    <div className="relative">
      {editor && (
        <BubbleMenu
          editor={editor}
          shouldShow={({ editor, state }) => {
            return editor.isActive('image') || !state.selection.empty;
          }}
          className="flex items-center gap-1 bg-nbac-panel border border-nbac-border rounded-lg shadow-xl px-2 py-1.5"
        >
          {editor.isActive('image') ? (
            <div className="flex items-center gap-1.5 font-sans text-[11px] text-white">
              <span className="text-nbac-muted px-1.5 font-medium uppercase tracking-wider text-[9px]">Size:</span>
              <button
                type="button"
                onClick={() => editor.chain().focus().updateAttributes('image', { width: '25%' }).run()}
                className={cn(
                  'px-2 py-1 rounded transition-colors cursor-pointer text-xs font-medium',
                  editor.getAttributes('image').width === '25%'
                    ? 'bg-nbac-emerald text-white font-semibold'
                    : 'text-nbac-body hover:bg-nbac-canvas hover:text-white'
                )}
                title="Resize to 25%"
              >
                25%
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().updateAttributes('image', { width: '50%' }).run()}
                className={cn(
                  'px-2 py-1 rounded transition-colors cursor-pointer text-xs font-medium',
                  editor.getAttributes('image').width === '50%'
                    ? 'bg-nbac-emerald text-white font-semibold'
                    : 'text-nbac-body hover:bg-nbac-canvas hover:text-white'
                )}
                title="Resize to 50%"
              >
                50%
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().updateAttributes('image', { width: '100%' }).run()}
                className={cn(
                  'px-2 py-1 rounded transition-colors cursor-pointer text-xs font-medium',
                  editor.getAttributes('image').width === '100%' || !editor.getAttributes('image').width
                    ? 'bg-nbac-emerald text-white font-semibold'
                    : 'text-nbac-body hover:bg-nbac-canvas hover:text-white'
                )}
                title="Resize to 100%"
              >
                100%
              </button>
            </div>
          ) : (
            <>
              <BubbleButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                label="B"
                title="Bold"
              />
              <BubbleButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                label="I"
                title="Italic"
              />
              <BubbleButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
                label="Title"
                title="Section title"
              />
              <BubbleButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive('heading', { level: 3 })}
                label="Subtitle"
                title="Subtitle"
              />
              <BubbleButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive('blockquote')}
                label="Quote"
                title="Pull quote"
              />
            </>
          )}
        </BubbleMenu>
      )}

      <div className="min-h-[400px] bg-nbac-canvas border border-nbac-border rounded-b-lg px-6 py-2">
        <EditorContent editor={editor} />
      </div>

      {/* Word count */}
      <div className="mt-4 pt-4 border-t border-nbac-border flex justify-between items-center">
        <span className="font-sans text-xs text-nbac-muted">
          {editor?.storage.characterCount.words() ?? 0} words
        </span>
        <span className="font-sans text-xs text-nbac-muted">
          {editor?.storage.characterCount.characters() ?? 0} characters
        </span>
      </div>
    </div>
  );
}

interface BubbleButtonProps {
  onClick: () => void;
  isActive: boolean;
  label: string;
  title: string;
}

function BubbleButton({ onClick, isActive, label, title }: BubbleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'px-2.5 py-1 rounded text-xs font-sans font-medium transition-colors cursor-pointer',
        isActive
          ? 'bg-nbac-emerald text-white font-semibold'
          : 'text-nbac-body hover:bg-nbac-canvas hover:text-nbac-text'
      )}
    >
      {label}
    </button>
  );
}
