'use client'

import React from 'react'
import { type Editor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import {
  Bold, Italic, List, ListOrdered, Quote, Heading2,
  Heading3, Link as LinkIcon, Image as ImageIcon,
  Undo, Redo, RemoveFormatting,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function ToolbarButton({ icon: Icon, label, active, onClick }: {
  icon:    React.ElementType
  label:   string
  active:  boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={cn(
        'p-1.5 rounded transition-colors cursor-pointer',
        active
          ? 'bg-nbac-emerald/20 text-nbac-emerald'
          : 'text-nbac-body hover:bg-nbac-panel hover:text-nbac-text'
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}

export function ToolbarDivider() {
  return <div className="h-4 w-px bg-nbac-border mx-1" />
}

export function BubbleButton({ icon: Icon, active, onClick }: {
  icon:    React.ElementType
  active:  boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'p-1.5 rounded transition-colors cursor-pointer',
        active
          ? 'bg-nbac-emerald text-white'
          : 'text-nbac-body hover:bg-nbac-canvas hover:text-nbac-text'
      )}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  )
}

interface EditorToolbarProps {
  editor: Editor | null
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null

  const addImage = () => {
    const url = window.prompt('Enter image URL:')
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('Enter URL:', previousUrl)
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <>
      {/* STATIC TOOLBAR */}
      <div className="flex items-center flex-wrap gap-0.5 p-2 bg-nbac-deep border-b border-nbac-border">
        <ToolbarButton
          icon={Bold} label="Bold"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          icon={Italic} label="Italic"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarDivider />

        <ToolbarButton
          icon={Heading2} label="Heading 2"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          icon={Heading3} label="Heading 3"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        />
        <ToolbarDivider />

        <ToolbarButton
          icon={List} label="Bullet List"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          icon={ListOrdered} label="Numbered List"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          icon={Quote} label="Quote"
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarDivider />

        <ToolbarButton
          icon={LinkIcon} label="Add Link"
          active={editor.isActive('link')}
          onClick={setLink}
        />
        <ToolbarButton
          icon={ImageIcon} label="Add Image"
          active={false}
          onClick={addImage}
        />
        <ToolbarDivider />

        <ToolbarButton
          icon={RemoveFormatting} label="Clear Formatting"
          active={false}
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        />
        <ToolbarDivider />

        <ToolbarButton
          icon={Undo} label="Undo"
          active={false}
          onClick={() => editor.chain().focus().undo().run()}
        />
        <ToolbarButton
          icon={Redo} label="Redo"
          active={false}
          onClick={() => editor.chain().focus().redo().run()}
        />
      </div>

      {/* BUBBLE MENU */}
      <BubbleMenu
        editor={editor}
        className="flex items-center gap-1 bg-nbac-panel border border-nbac-border rounded-lg shadow-xl p-1 z-50"
      >
        <BubbleButton
          icon={Bold}
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <BubbleButton
          icon={Italic}
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <BubbleButton
          icon={Heading2}
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <BubbleButton
          icon={Heading3}
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        />
        <BubbleButton
          icon={LinkIcon}
          active={editor.isActive('link')}
          onClick={setLink}
        />
      </BubbleMenu>
    </>
  )
}
