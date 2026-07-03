'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Globe, FileEdit, Image as ImageIcon } from 'lucide-react';
import { useAdminRole } from '@/hooks/use-admin-role';
import { RoleBanner } from '@/components/admin/role-banner';
import { getStoredPosts, saveStoredPosts, type BlogPost } from '@/lib/blog-data';
import type { ContentPost } from '@/types';

export default function ContentManagerPage() {
  const { isHeadAdmin } = useAdminRole();
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load posts on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setPosts(getStoredPosts() as ContentPost[]);
      setLoaded(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Save posts to localStorage when changed
  useEffect(() => {
    if (loaded) {
      try {
        saveStoredPosts(posts as unknown as BlogPost[]);
      } catch (err) {
        console.error('Failed to save posts to localStorage:', err);
      }
    }
  }, [posts, loaded]);

  // Delete handler (Head Admin only)
  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete: "${title}"?\nThis action cannot be undone.`)) {
      setPosts(posts.filter((post) => post.id !== id));
    }
  };

  const formatPostType = (type: string) => {
    if (type === 'press_release') return 'Press Release';
    if (type === 'sponsor_update') return 'Sponsor Update';
    if (type === 'event_copy') return 'Event Copy';
    if (type === 'announcement') return 'Announcement';
    if (type === 'blank') return 'General';
    return type;
  };

  return (
    <div className="space-y-6">
      <RoleBanner />

      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="font-sans text-xs uppercase tracking-widest font-semibold text-nbac-emerald-light">
            Website Content Control
          </span>
          <h2 className="font-display text-2xl font-bold text-nbac-text mt-1">
            Articles & Announcements
          </h2>
        </div>
        <Link
          href="/admin/content/new"
          className="bg-nbac-emerald hover:bg-nbac-emerald-dark text-white font-sans font-medium px-5 py-2.5 rounded-lg transition-all flex items-center gap-2 text-sm shadow-md shadow-nbac-emerald/10 cursor-pointer hover:scale-[1.01]"
        >
          <Plus size={16} />
          <span>Publish New Post</span>
        </Link>
      </div>

      {/* Content List Table */}
      <div className="bg-nbac-panel border border-nbac-border rounded-lg overflow-hidden select-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-nbac-border bg-[#0b0f10]/30 font-sans text-xs uppercase tracking-wider font-semibold text-nbac-muted">
                <th className="p-4 pl-6">Title</th>
                <th className="p-4">Type</th>
                <th className="p-4">Status</th>
                <th className="p-4">Last Updated</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nbac-border font-sans text-sm">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-nbac-muted font-sans text-xs">
                    No articles or announcements found. Click &quot;Publish New Post&quot; to create one.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-nbac-canvas/40 transition-colors">
                    {/* Title & Image */}
                    <td className="p-4 pl-6 font-medium text-nbac-text max-w-md truncate">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-7 rounded bg-[#0b0f10] border border-nbac-border overflow-hidden shrink-0 flex items-center justify-center relative">
                          {post.cover_image_url || post.featured_image ? (
                            <img
                              src={post.cover_image_url || post.featured_image}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon size={12} className="text-nbac-muted" />
                          )}
                        </div>
                        <span className="truncate" title={post.title}>
                          {post.title}
                        </span>
                      </div>
                    </td>

                    {/* Category Type */}
                    <td className="p-4">
                      <span className="text-nbac-muted text-xs bg-nbac-canvas border border-nbac-border px-2.5 py-1 rounded-md">
                        {formatPostType(post.type)}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td className="p-4">
                      {post.status === 'published' ? (
                        <span className="bg-nbac-emerald/15 text-nbac-emerald text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                          <Globe size={10} />
                          <span>Published</span>
                        </span>
                      ) : (
                        <span className="bg-nbac-amber/15 text-nbac-amber text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                          <FileEdit size={10} />
                          <span>Draft</span>
                        </span>
                      )}
                    </td>

                    {/* Last Updated Date */}
                    <td className="p-4 text-nbac-body text-xs">
                      {post.updated_at}
                    </td>

                    {/* Actions */}
                    <td className="p-4 pr-6 text-right space-x-2">
                      <Link
                        href={`/admin/content/${post.id}/edit`}
                        className="text-nbac-body hover:text-nbac-gold p-1.5 rounded bg-nbac-canvas border border-nbac-border hover:border-nbac-gold/30 transition-colors cursor-pointer inline-flex items-center"
                        title="Edit article"
                      >
                        <Edit size={14} />
                      </Link>

                      {isHeadAdmin && (
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          className="text-nbac-danger/80 hover:text-nbac-danger hover:bg-nbac-danger/10 p-1.5 rounded bg-nbac-canvas border border-nbac-border hover:border-nbac-danger/30 transition-colors cursor-pointer inline-flex items-center"
                          title="Delete article"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
