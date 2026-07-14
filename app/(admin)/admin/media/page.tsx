'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo, useId } from 'react';
import { Image as ImageIcon, Upload, Trash2, Tag, Loader2, FileText, Search, X, Calendar } from 'lucide-react';
import { useAdminRole } from '@/hooks/use-admin-role';
import { RoleBanner } from '@/components/admin/role-banner';
import { createClient } from '@/lib/supabase/client';
import { logAdminActivity } from '@/lib/blog-data';
import { useToast } from '@/components/shared/toast';
import { AlertDialog } from '@/components/shared/alert-dialog';

interface MediaAsset {
  id: string;
  file_name: string;
  file_url: string;
  storage_path: string;
  tags: string[];
  uploaded_by: string;
  file_size?: string;
  created_at: string;
  category: 'Conference' | 'Exhibition' | 'Gala Dinner' | 'Networking';
  year: '2026' | '2017' | '2016' | '2014' | '2013';
}

interface StagedFile {
  id: string;
  file: File;
}

const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'application/pdf',
]);

function generateUniquePath(fileName: string): string {
  const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `uploads/${Date.now()}_${cleanName}`;
}

export default function MediaGalleryPage() {
  const supabase = createClient();
  const { isHeadAdmin } = useAdminRole();
  const toast = useToast();
  const [mediaItems, setMediaItems] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [uploadStatus, setUploadStatus] = useState<{ [key: string]: 'idle' | 'uploading' | 'completed' | 'failed' }>({});
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const uploadStatusRef = useRef(uploadStatus);
  uploadStatusRef.current = uploadStatus;
  const stagedFileIdCounter = useRef(0);
  const [tagInput, setTagInput] = useState('');
  const [categoryInput, setCategoryInput] = useState<'Conference' | 'Exhibition' | 'Gala Dinner' | 'Networking'>('Conference');
  const [yearInput, setYearInput] = useState<'2026' | '2017' | '2016' | '2014' | '2013'>('2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; storagePath: string } | null>(null);

  const fetchMedia = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('media_assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching media:', error.message);
      } else if (data) {
        setMediaItems(data);
      }
    } catch (err) {
      console.error('Failed to load media assets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchMedia();
    });
  }, [fetchMedia]);

  const filteredItems = useMemo(() => {
    if (searchQuery.trim() === '') {
      return mediaItems;
    }
    const q = searchQuery.toLowerCase();
    return mediaItems.filter(
      item =>
        item.file_name.toLowerCase().includes(q) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(q)))
    );
  }, [searchQuery, mediaItems]);

  const formatBytes = (bytes: number, decimals = 1) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleFilesSelection = (files: FileList) => {
    const validFiles: StagedFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        toast.error('Unsupported File Type', { description: `File "${file.name}" is not a supported format. Use PNG, JPG, WEBP, GIF, or PDF.` });
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File Size Limit Exceeded', { description: `File "${file.name}" exceeds the 5MB size limit.` });
        continue;
      }
      stagedFileIdCounter.current += 1;
      validFiles.push({ id: `staged_${Date.now()}_${stagedFileIdCounter.current}`, file });
    }
    setStagedFiles(prev => [...prev, ...validFiles]);
  };

  const startUpload = async () => {
    if (stagedFiles.length === 0) return;
    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const email = user?.email || 'unknown_admin';

      const tags = tagInput
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      // Initialize status
      const initialStatus: { [key: string]: 'idle' | 'uploading' | 'completed' | 'failed' } = {};
      stagedFiles.forEach(sf => {
        initialStatus[sf.id] = 'idle';
      });
      setUploadStatus(initialStatus);

      for (let i = 0; i < stagedFiles.length; i++) {
        const sf = stagedFiles[i];
        const file = sf.file;
        const fileId = sf.id;
        
        // Mark file as uploading
        setUploadStatus(prev => ({ ...prev, [fileId]: 'uploading' }));
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
        
        // Simulate progress increment while upload is in progress (since standard upload lacks callback)
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const current = prev[fileId] || 0;
            if (current >= 90) return prev;
            return { ...prev, [fileId]: current + 10 };
          });
        }, 150);

        try {
          const uniquePath = generateUniquePath(file.name);

          const { error: uploadError } = await supabase.storage
            .from('media')
            .upload(uniquePath, file, {
              cacheControl: '3600',
              upsert: false,
            });

          clearInterval(progressInterval);

          if (uploadError) {
            console.error('Storage upload error:', uploadError.message);
            setUploadStatus(prev => ({ ...prev, [fileId]: 'failed' }));
            toast.error(`Failed to upload ${file.name}`, { description: uploadError.message });
            continue;
          }

          setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));

          const { data: { publicUrl } } = supabase.storage
            .from('media')
            .getPublicUrl(uniquePath);

          const { error: dbError } = await supabase
            .from('media_assets')
            .insert({
              file_name: file.name,
              file_url: publicUrl,
              storage_path: uniquePath,
              tags,
              uploaded_by: email,
              file_size: formatBytes(file.size),
              category: categoryInput,
              year: yearInput,
            });

          if (dbError) {
            console.error('Database save error:', dbError.message);
            await supabase.storage.from('media').remove([uniquePath]);
            setUploadStatus(prev => ({ ...prev, [fileId]: 'failed' }));
            toast.error(`Failed to save metadata for ${file.name}`, { description: dbError.message });
            continue;
          }

          setUploadStatus(prev => ({ ...prev, [fileId]: 'completed' }));
          toast.success('Picture Uploaded', { description: `${file.name} uploaded successfully.`, image: publicUrl });
          try {
            await logAdminActivity('edited', `Uploaded media asset: ${file.name}`);
          } catch (logErr) {
            console.error('Failed to log admin activity for upload:', logErr);
          }
        } catch (err) {
          clearInterval(progressInterval);
          console.error(`Error uploading ${file.name}:`, err);
          setUploadStatus(prev => ({ ...prev, [fileId]: 'failed' }));
        }
      }

      // Clear only completed files after a brief delay; preserve failed files for retry
      setTimeout(() => {
        const currentStatus = uploadStatusRef.current;
        const hasFailed = Object.values(currentStatus).some(s => s === 'failed');

        setStagedFiles(prev => prev.filter(sf => currentStatus[sf.id] === 'failed'));
        setUploadStatus(prev => {
          const kept: typeof prev = {};
          for (const [key, val] of Object.entries(prev)) {
            if (val === 'failed') kept[key] = val;
          }
          return kept;
        });
        setUploadProgress(prev => {
          const kept: typeof prev = {};
          for (const [key] of Object.entries(prev)) {
            if (currentStatus[key] === 'failed') kept[key] = prev[key];
          }
          return kept;
        });
        if (!hasFailed) {
          setTagInput('');
        }
        setUploading(false);
        fetchMedia();
      }, 1000);

    } catch (err) {
      console.error('Upload process failed:', err);
      toast.error('An unexpected error occurred during upload.');
      setUploading(false);
    }
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFilesSelection(e.dataTransfer.files);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFilesSelection(e.target.files);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string, name: string, storagePath: string) => {
    try {
      const { error: storageError } = await supabase.storage
        .from('media')
        .remove([storagePath]);
 
      if (storageError) {
        console.error('Failed to delete file from storage:', storageError.message);
      }
 
      const { error: dbError } = await supabase
        .from('media_assets')
        .delete()
        .eq('id', id);
 
      if (dbError) {
        console.error('Failed to delete metadata from DB:', dbError.message);
        toast.error(`Failed to delete record: ${dbError.message}`);
        return;
      }
 
      await logAdminActivity('deleted', `Deleted media asset: ${name}`);
      setMediaItems(prev => prev.filter(item => item.id !== id));
      toast.success('Picture Deleted', { description: `${name} has been permanently deleted.` });
      setDeleteTarget(null);
    } catch (err) {
      console.error('Delete process failed:', err);
      toast.error('An unexpected error occurred during deletion.');
    }
  };

  const isPdf = (fileName: string) => fileName.toLowerCase().endsWith('.pdf');

  return (
    <div className="space-y-6">
      <RoleBanner />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-sans text-xs uppercase tracking-widest font-semibold text-nbac-gold-light">
            Conference Assets Control
          </span>
          <h2 className="font-display text-2xl font-bold text-nbac-text mt-1">
            Media Gallery Updater
          </h2>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-nbac-muted" />
          <input
            type="text"
            placeholder="Search assets or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0b0f10] border border-nbac-border text-nbac-text placeholder:text-nbac-muted/65 text-xs rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-nbac-gold/45 font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-nbac-muted hover:text-white"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Upload Zone & Optional Tags/Category/Year Inputs */}
      <div className="bg-nbac-panel border border-nbac-border rounded-xl p-5 md:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          <div className="w-full lg:w-3/5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Category Select */}
            <div className="space-y-1.5">
              <label className="font-sans text-xs font-semibold text-nbac-text flex items-center gap-1.5">
                <Tag size={12} className="text-nbac-gold-light" />
                <span>Category</span>
              </label>
              <select
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value as typeof categoryInput)}
                className="w-full bg-[#070b0c] border border-nbac-border text-nbac-text text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-nbac-gold/45 font-sans"
                disabled={uploading}
              >
                <option value="Conference">Conference</option>
                <option value="Exhibition">Exhibition</option>
                <option value="Gala Dinner">Gala Dinner</option>
                <option value="Networking">Networking</option>
              </select>
            </div>

            {/* Year Select */}
            <div className="space-y-1.5">
              <label className="font-sans text-xs font-semibold text-nbac-text flex items-center gap-1.5">
                <Calendar size={12} className="text-nbac-gold-light" />
                <span>Year</span>
              </label>
              <select
                value={yearInput}
                onChange={(e) => setYearInput(e.target.value as typeof yearInput)}
                className="w-full bg-[#070b0c] border border-nbac-border text-nbac-text text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-nbac-gold/45 font-sans"
                disabled={uploading}
              >
                <option value="2026">2026</option>
                <option value="2017">2017</option>
                <option value="2016">2016</option>
                <option value="2014">2014</option>
                <option value="2013">2013</option>
              </select>
            </div>

            {/* Tags Input */}
            <div className="space-y-1.5">
              <label className="font-sans text-xs font-semibold text-nbac-text flex items-center gap-1.5">
                <Tag size={12} className="text-nbac-gold-light" />
                <span>Tags (optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Day 1, Keynote"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="w-full bg-[#070b0c] border border-nbac-border text-nbac-text placeholder:text-nbac-muted/40 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-nbac-gold/45 font-sans"
                disabled={uploading}
              />
            </div>
          </div>

          <div className="w-full lg:w-2/5">
            <input
              type="file"
              ref={fileInputRef}
              onChange={onFileChange}
              accept="image/png, image/jpeg, image/webp, image/gif, application/pdf"
              multiple
              className="hidden"
              disabled={uploading}
            />

            <div
              onDragEnter={onDrag}
              onDragLeave={onDrag}
              onDragOver={onDrag}
              onDrop={onDrop}
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-5 text-center transition-all duration-300 select-none group cursor-pointer ${dragActive
                  ? 'border-nbac-gold bg-[#0b0f10]/80'
                  : 'border-nbac-border hover:border-nbac-gold/30 bg-[#0b0f10]/20 hover:bg-[#0b0f10]/40'
                } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-nbac-panel border border-nbac-border flex items-center justify-center text-nbac-muted group-hover:text-nbac-gold transition-colors">
                  {uploading ? (
                    <Loader2 size={16} className="animate-spin text-nbac-gold" />
                  ) : (
                    <Upload size={16} />
                  )}
                </div>
                <div className="space-y-0.5">
                  <p className="font-sans text-xs font-semibold text-nbac-text">
                    {uploading ? 'Staging assets...' : 'Select or Drop New Assets'}
                  </p>
                  <p className="font-sans text-[10px] text-nbac-muted font-light">
                    PNG, JPG, WEBP, GIF, or PDF (Max 5MB each).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Staged Files and Progress Section */}
      {stagedFiles.length > 0 && (
        <div className="bg-nbac-panel border border-nbac-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-nbac-border pb-3">
            <h3 className="font-display text-sm font-semibold text-nbac-text flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-nbac-gold animate-pulse" />
              Staged Assets ({stagedFiles.length})
            </h3>
            <button
              onClick={() => {
                if (!uploading) {
                  setStagedFiles([]);
                  setUploadStatus({});
                  setUploadProgress({});
                }
              }}
              disabled={uploading}
              className="text-xs text-nbac-muted hover:text-white transition-colors disabled:opacity-50 font-sans"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {stagedFiles.map((sf) => {
              const file = sf.file;
              const status = uploadStatus[sf.id] || 'idle';
              const progress = uploadProgress[sf.id] || 0;
              return (
                <div
                  key={sf.id}
                  className="bg-[#0b0f10]/40 border border-nbac-border/60 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-sans text-xs text-nbac-text font-semibold truncate block max-w-md">
                        {file.name}
                      </span>
                      <span className="font-sans text-[10px] text-nbac-muted">
                        ({formatBytes(file.size)})
                      </span>
                    </div>

                    {/* Progress Bar */}
                    {status === 'uploading' && (
                      <div className="w-full bg-nbac-canvas rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-nbac-gold h-1.5 rounded-full transition-all duration-300 animate-pulse"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                    {status === 'completed' && (
                      <div className="w-full bg-nbac-canvas rounded-full h-1.5 overflow-hidden">
                        <div className="bg-nbac-emerald h-1.5 rounded-full" style={{ width: '100%' }} />
                      </div>
                    )}
                    {status === 'failed' && (
                      <div className="w-full bg-nbac-canvas rounded-full h-1.5 overflow-hidden">
                        <div className="bg-nbac-danger h-1.5 rounded-full" style={{ width: '100%' }} />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Status Badge */}
                    {status === 'idle' && (
                      <span className="text-[10px] text-nbac-muted font-sans border border-nbac-border px-2 py-0.5 rounded">
                        Ready
                      </span>
                    )}
                    {status === 'uploading' && (
                      <span className="text-[10px] text-nbac-gold font-sans border border-nbac-gold/30 px-2 py-0.5 rounded flex items-center gap-1.5">
                        <Loader2 size={10} className="animate-spin" />
                        Uploading {progress}%
                      </span>
                    )}
                    {status === 'completed' && (
                      <span className="text-[10px] text-nbac-emerald font-sans border border-nbac-emerald/30 px-2 py-0.5 rounded">
                        Success
                      </span>
                    )}
                    {status === 'failed' && (
                      <span className="text-[10px] text-nbac-danger font-sans border border-nbac-danger/30 px-2 py-0.5 rounded">
                        Failed
                      </span>
                    )}

                    {/* Remove button */}
                    {status === 'idle' && (
                      <button
                        onClick={() => {
                          setStagedFiles(prev => prev.filter(s => s.id !== sf.id));
                        }}
                        className="text-nbac-muted hover:text-nbac-danger transition-colors"
                        title="Remove file"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={startUpload}
              disabled={uploading}
              className="bg-linear-to-r from-nbac-gold via-nbac-gold-light to-nbac-gold text-[#0b0f10] font-sans font-bold px-6 py-2.5 rounded-lg transition-all duration-300 shadow-md hover:shadow-nbac-gold/10 text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Uploading Assets...</span>
                </>
              ) : (
                <>
                  <Upload size={14} />
                  <span>Post {stagedFiles.length} {stagedFiles.length === 1 ? 'Asset' : 'Assets'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Loader/Empty State */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-nbac-gold" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="border border-nbac-border rounded-xl p-12 text-center bg-nbac-panel/30">
          <ImageIcon size={32} className="mx-auto text-nbac-muted mb-2 opacity-50" />
          <p className="font-sans text-sm text-nbac-text font-semibold">No media assets found</p>
          <p className="font-sans text-xs text-nbac-muted mt-1 max-w-xs mx-auto">
            {searchQuery
              ? 'No assets match your search parameters. Try searching for a different term or tag.'
              : 'Upload images or PDFs above to build out your conference media repository.'}
          </p>
        </div>
      ) : (
        /* Media Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-nbac-panel border border-nbac-border rounded-lg overflow-hidden group select-none relative flex flex-col justify-between"
            >
              {/* Image display */}
              <div className="relative aspect-video w-full bg-[#070b0c] overflow-hidden flex items-center justify-center border-b border-nbac-border">
                {isPdf(item.file_name) ? (
                  <div className="flex flex-col items-center gap-2 text-nbac-muted/75 group-hover:text-nbac-gold transition-colors duration-300">
                    <FileText size={36} />
                    <span className="font-sans text-[10px] font-medium max-w-[80%] truncate">
                      PDF Document
                    </span>
                  </div>
                ) : (
                  <>
                    {/* Fallback pattern while loading */}
                    <div className="absolute inset-0 flex items-center justify-center text-nbac-border">
                      <ImageIcon size={32} />
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.file_url}
                      alt={item.file_name}
                      className="w-full h-full object-cover relative z-10 transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </>
                )}

                {/* View link overlay */}
                <a
                  href={item.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 bg-[#000000]/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 z-20 cursor-pointer text-white font-sans text-xs font-semibold"
                >
                  View Original File
                </a>
              </div>

              {/* Details Panel */}
              <div className="p-4 space-y-3 relative z-20 bg-nbac-panel grow flex flex-col justify-between">
                <div className="min-w-0 space-y-1">
                  <p className="font-sans text-xs font-semibold text-nbac-text truncate" title={item.file_name}>
                    {item.file_name}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-nbac-muted font-light">
                    <span>Size: {item.file_size || 'Unknown'}</span>
                    <span>By: {item.uploaded_by.split('@')[0]}</span>
                  </div>
                </div>

                {/* Category and Year Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="bg-nbac-emerald/10 text-nbac-emerald-light border border-nbac-emerald/20 px-2 py-0.5 rounded-[4px] text-[9px] font-semibold uppercase tracking-wider">
                    {item.year || '2026'}
                  </span>
                  <span className="bg-nbac-gold/10 text-nbac-gold-light border border-nbac-gold/20 px-2 py-0.5 rounded-[4px] text-[9px] font-semibold uppercase tracking-wider">
                    {item.category || 'Conference'}
                  </span>
                </div>

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
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
                )}

                {/* Delete Overlay Actions */}
                {isHeadAdmin && (
                  <div className="pt-2 border-t border-nbac-border flex justify-end">
                    <button
                      onClick={() => setDeleteTarget({ id: item.id, name: item.file_name, storagePath: item.storage_path })}
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
      )}
 
      <AlertDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            handleDelete(deleteTarget.id, deleteTarget.name, deleteTarget.storagePath);
          }
        }}
        title="Delete Media Asset"
        description={`Are you sure you want to permanently delete "${deleteTarget?.name || 'this asset'}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
