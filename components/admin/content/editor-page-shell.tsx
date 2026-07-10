'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { type Editor } from '@tiptap/react';
import { getDbPosts, saveDbPost, deleteDbPost, logAdminActivity, type BlogPost } from '@/lib/blog-data';
import { EDITOR_TEMPLATES } from '@/lib/editor-templates';
import type { PostTemplate, PostVisibility } from '@/types';
import { useAdminRole } from '@/hooks/use-admin-role';
import { PublishBar } from './publish-bar';
import { EditorToolbar } from './editor-toolbar';
import { PostEditor } from './post-editor';
import { DocumentSettings } from './document-settings';
import { useToast } from '@/components/shared/toast';
import { AlertDialog } from '@/components/shared/alert-dialog';

interface EditorPageShellProps {
  mode: 'create' | 'edit';
  template?: PostTemplate;
  postId?: string;
}

export function EditorPageShell({ mode, template = 'blank', postId }: EditorPageShellProps) {
  const router = useRouter();
  const { role } = useAdminRole();
  const toast = useToast();
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Dynamic mode and post ID tracking to convert create to edit after first save
  const [currentPostId, setCurrentPostId] = useState<string | undefined>(postId);
  const [currentMode, setCurrentMode] = useState<'create' | 'edit'>(mode);

  const [prevPostId, setPrevPostId] = useState<string | undefined>(postId);
  const [prevMode, setPrevMode] = useState<'create' | 'edit'>(mode);

  if (postId !== prevPostId || mode !== prevMode) {
    setPrevPostId(postId);
    setPrevMode(mode);
    setCurrentPostId(postId);
    setCurrentMode(mode);
  }

  // Core Form States
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [postType, setPostType] = useState<PostTemplate>(template);
  const [visibility, setVisibility] = useState<PostVisibility>('draft');
  const [authorName, setAuthorName] = useState('Staff Editor');
  const [coverImageUrl, setCoverImageUrl] = useState('');

  // Status & Timers
  const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'saving'>('saved');
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Execute Save/Update logic
  const executeSave = useCallback(async (targetVisibility: PostVisibility, navigateBackAfterSave = false) => {
    if (!title.trim()) {
      // Skip auto-saves without title to avoid user annoyance, only alert on manual clicks
      if (navigateBackAfterSave) {
        toast.error('Please enter a title before saving.');
      }
      return;
    }

    if (isMountedRef.current) {
      setSaveStatus('saving');
    }

    try {
      const posts = await getDbPosts();
      const now = new Date();
      const nowIso = now.toISOString();
      let targetPostId = currentPostId;
      let newPostObj: BlogPost;

      if (currentMode === 'edit' && currentPostId) {
        // Update existing post
        newPostObj = {
          id: currentPostId,
          title,
          type: postType,
          status: targetVisibility,
          author_id: 'user_admin',
          author: authorName, // back-compat
          author_name: authorName,
          body,
          cover_image_url: coverImageUrl,
          featured_image: coverImageUrl, // back-compat
          created_at: nowIso, // fallback
          updated_at: nowIso,
        };
        const existingPost = posts.find((p) => p.id === currentPostId);
        if (existingPost) {
          newPostObj.created_at = existingPost.created_at;
        }
      } else {
        // Create new post - generate a robust unique ID with random suffix to avoid collisions
        const newPostId = `post_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        targetPostId = newPostId;
        newPostObj = {
          id: newPostId,
          title,
          type: postType,
          status: targetVisibility,
          author_id: 'user_admin',
          author: authorName, // legacy field populated
          author_name: authorName,
          body,
          cover_image_url: coverImageUrl,
          featured_image: coverImageUrl, // back-compat
          created_at: nowIso,
          updated_at: nowIso,
        };
      }

      const success = await saveDbPost(newPostObj);
      if (!success) {
        throw new Error('Database save failed');
      }

      // Log admin activity
      const logAction = currentMode === 'edit' ? 'edited' : 'published';
      await logAdminActivity(logAction, `${logAction === 'published' ? 'Published' : 'Edited'} article: "${title}" (ID: ${targetPostId})`);

      if (isMountedRef.current) {
        if (currentMode !== 'edit') {
          // Transition state to edit mode so subsequent updates edit this post
          setCurrentPostId(targetPostId);
          setCurrentMode('edit');
          
          // Update the browser URL without full reload so refresh loads the edit page
          window.history.replaceState(null, '', `/admin/content/${targetPostId}/edit`);
        }

        setSaveStatus('saved');
      }

      if (navigateBackAfterSave) {
        router.push('/admin/content');
      }
    } catch (err) {
      console.error('Save failed', err);
      if (isMountedRef.current) {
        setSaveStatus('unsaved');
      }
    }
  }, [title, body, postType, authorName, coverImageUrl, currentMode, currentPostId, router]);

  // Keep refs of latest values for executeSave to be accessed safely on unmount
  const executeSaveRef = useRef(executeSave);
  const visibilityRef = useRef(visibility);

  useEffect(() => {
    executeSaveRef.current = executeSave;
  }, [executeSave]);

  useEffect(() => {
    visibilityRef.current = visibility;
  }, [visibility]);

  // Set initial default author name from user role if available
  useEffect(() => {
    if (role && mode === 'create') {
      const timer = setTimeout(() => {
        setAuthorName(role === 'head_admin' ? 'Chief Coordinator' : 'Staff Editor');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [role, mode]);

  // Load existing post in Edit Mode
  useEffect(() => {
    if (mode === 'edit' && postId) {
      let active = true;
      async function loadPost() {
        const posts = await getDbPosts();
        if (!active) return;
        const post = posts.find((p) => p.id === postId);
        if (post) {
          setTitle(post.title);
          setBody(post.body);
          setPostType(post.type);
          setVisibility(post.status);
          setAuthorName(post.author_name || post.author || 'Staff Editor');
          setCoverImageUrl(post.cover_image_url || post.featured_image || '');
        } else {
          toast.error('Post not found.');
          router.push('/admin/content');
        }
      }
      loadPost();
      return () => {
        active = false;
      };
    } else if (mode === 'create') {
      // In create mode, pre-fill title and body based on template
      const defaultTpl = EDITOR_TEMPLATES[template];
      if (defaultTpl) {
        const timer = setTimeout(() => {
          setTitle(defaultTpl.title);
          setBody(defaultTpl.body);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [mode, postId, template, router]);

  // Clean up timers on unmount - flush any pending debounced save
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        executeSaveRef.current(visibilityRef.current, false);
      }
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    };
  }, []);

  // Set up 30-second interval auto-save if unsaved
  useEffect(() => {
    if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);

    autoSaveTimerRef.current = setInterval(() => {
      if (saveStatus === 'unsaved') {
        executeSave(visibility, false); // auto-save keeps current visibility
      }
    }, 30000);

    return () => {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    };
  }, [saveStatus, visibility, executeSave]);

  // Change title handler
  const handleTitleChange = (val: string) => {
    setTitle(val);
    triggerDebouncedSave();
  };

  // Change body handler (Tiptap callback)
  const handleContentChange = (html: string) => {
    setBody(html);
    triggerDebouncedSave();
  };

  // Debounced auto-save (3 seconds after user stops typing)
  const triggerDebouncedSave = () => {
    setSaveStatus('unsaved');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      executeSave(visibility, false);
    }, 3000);
  };

  // Save as Draft manual button click
  const handleSaveDraft = () => {
    setVisibility('draft');
    executeSave('draft', true);
  };

  // Publish manual button click
  const handlePublish = () => {
    setVisibility('published');
    executeSave('published', true);
  };

  // Delete handler (Danger Zone)
  const handleDeletePost = () => {
    if (currentMode === 'edit' && currentPostId) {
      setShowDeleteConfirm(true);
    }
  };

  // Handle immediate save on editor blur
  const handleEditorBlur = () => {
    if (saveStatus === 'unsaved') {
      executeSave(visibility, false);
    }
  };

  return (
    <div className="min-h-screen bg-nbac-canvas text-nbac-text flex flex-col select-none">
      <AlertDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={async () => {
          if (currentMode === 'edit' && currentPostId) {
            const success = await deleteDbPost(currentPostId);
            if (success) {
              await logAdminActivity('deleted', `Deleted article: "${title}" (ID: ${currentPostId})`);
              toast.success('Article deleted successfully');
              router.push('/admin/content');
            } else {
              toast.error('Failed to delete article from the database.');
            }
          }
        }}
        title="Delete Article"
        description="Are you sure you want to permanently delete this article? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
      {/* Sticky Publish Bar (Top) */}
      <PublishBar
        template={postType}
        status={visibility}
        onStatusChange={(status) => {
          setVisibility(status);
          executeSave(status, false);
        }}
        saveStatus={saveStatus}
        onSave={handleSaveDraft}
        onPublish={handlePublish}
        isEditMode={currentMode === 'edit'}
      />

      {/* Main Workspace split into Writing Area and Settings Sidebar */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column - Writing Area */}
        <div className="flex-1 overflow-y-auto px-6 md:px-12 py-8 bg-[#0b0f10]/95 flex justify-center h-[calc(100vh-4rem)]">
          <div className="max-w-3xl w-full space-y-6">
            {/* Title Input field */}
            <div className="space-y-3">
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Post title..."
                className="w-full bg-transparent text-white font-display text-3xl md:text-4xl font-bold tracking-tight leading-tight outline-none border-none placeholder:text-nbac-muted"
                onBlur={handleEditorBlur}
              />
              <div className="h-px bg-nbac-border w-full" />
            </div>

            {/* Editor toolbar */}
            <div className="rounded-t-lg overflow-hidden border border-nbac-border border-b-0">
              <EditorToolbar editor={editorInstance} />
            </div>

            {/* Post Rich Text Editor */}
            <PostEditor
              template={postType}
              initialContent={body}
              onChange={handleContentChange}
              onEditorCreated={(editor) => {
                setEditorInstance(editor);
                // Bind blur handler for immediate auto-saving
                editor.on('blur', handleEditorBlur);
              }}
            />
          </div>
        </div>

        {/* Right Column - Post Settings Sidebar */}
        <DocumentSettings
          authorName={authorName}
          onAuthorNameChange={(name) => {
            setAuthorName(name);
            triggerDebouncedSave();
          }}
          category={postType}
          onCategoryChange={(cat) => {
            setPostType(cat);
            triggerDebouncedSave();
          }}
          coverImageUrl={coverImageUrl}
          onCoverImageUrlChange={(url) => {
            setCoverImageUrl(url);
            triggerDebouncedSave();
          }}
          visibility={visibility}
          onVisibilityChange={(vis) => {
            setVisibility(vis);
            executeSave(vis, false);
          }}
          isEditMode={currentMode === 'edit'}
          onDelete={handleDeletePost}
        />
      </div>
    </div>
  );
}
