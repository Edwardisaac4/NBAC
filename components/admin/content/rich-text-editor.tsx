'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit  from '@tiptap/starter-kit'
import Image       from '@tiptap/extension-image'
import Link        from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect } from 'react'
import { EditorToolbar } from './editor-toolbar'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: false,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Placeholder.configure({
        placeholder: 'Start writing your post here... Use headings, lists, and images to format your story.',
      }),
    ],
    content,
    editorProps: {
      attributes: {
        className: 'prose prose-invert max-w-none min-h-[350px] p-6 text-nbac-text text-sm leading-relaxed ' +
                   'focus:outline-none ' +
                   '[&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-nbac-text [&_h2]:mt-6 [&_h2]:mb-3 ' +
                   '[&_h3]:font-display [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-nbac-text [&_h3]:mt-4 [&_h3]:mb-2 ' +
                   '[&_p]:mb-4 [&_p]:text-nbac-body ' +
                   '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:text-nbac-body ' +
                   '[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:text-nbac-body ' +
                   '[&_blockquote]:border-l-4 [&_blockquote]:border-nbac-emerald [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-nbac-muted [&_blockquote]:my-4 ' +
                   '[&_a]:text-nbac-emerald [&_a]:underline ' +
                   '[&_img]:rounded-xl [&_img]:max-h-[400px] [&_img]:object-cover [&_img]:my-4 [&_img]:border [&_img]:border-nbac-border ' +
                   '[&_.is-editor-empty:first-child::before]:text-nbac-muted/50 ' +
                   '[&_.is-editor-empty:first-child::before]:float-left ' +
                   '[&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] ' +
                   '[&_.is-editor-empty:first-child::before]:pointer-events-none ' +
                   '[&_.is-editor-empty:first-child::before]:h-0',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Sync content if it changes externally (e.g. template selection change)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) return null

  return (
    <div className="border border-nbac-border rounded-xl bg-nbac-canvas overflow-hidden">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
