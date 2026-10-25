'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Upload,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  ExternalLink,
  ChevronDown,
  ImagePlus,
} from 'lucide-react';
import { useAdminRole } from '@/hooks/use-admin-role';
import { RoleBanner } from '@/components/admin/role-banner';
import { AccessibleModal } from '@/components/shared/accessible-modal';
import { AlertDialog } from '@/components/shared/alert-dialog';
import { useToast } from '@/components/shared/toast';
import { createClient } from '@/lib/supabase/client';
import { logAdminActivity } from '@/lib/admin-logger';
import { isValidHttpUrl } from '@/lib/utils';
import { PARTNER_TIERS, partnerTierLabel, type Partner, type PartnerTier } from '@/lib/partners';

// Must match the `media` bucket's allowed types; it does not accept SVG.
const ALLOWED_LOGO_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const MAX_LOGO_BYTES = 5 * 1024 * 1024; // the bucket's file_size_limit

const inputClass =
  'w-full bg-[#0b0f10] border border-nbac-border focus:border-nbac-gold rounded-lg px-3 py-2.5 text-base sm:text-xs text-nbac-text focus:outline-none transition-colors';
const labelClass = 'block text-[10px] uppercase tracking-wider font-semibold text-nbac-muted mb-1.5';

function logoPath(fileName: string): string {
  const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `uploads/partner_${Date.now()}_${cleanName}`;
}

export default function PartnersPage() {
  useAdminRole();
  const toast = useToast();

  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Add form
  const [name, setName] = useState('');
  const [tier, setTier] = useState<PartnerTier>('platinum');
  const [website, setWebsite] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit / delete
  const [editing, setEditing] = useState<Partner | null>(null);
  const [editName, setEditName] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Partner | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchPartners() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('partners')
          .select('*')
          .order('sort_order', { ascending: true })
          .order('name', { ascending: true });

        if (!active) return;

        if (error) {
          console.error('Failed to fetch partners:', error.message);
          setFetchError(
            error.code === 'PGRST205' || error.code === '42P01'
              ? 'The partners table does not exist yet. Apply migration 011 in Supabase.'
              : 'Could not load partners. Please refresh or check your access level.'
          );
          return;
        }
        setPartners((data || []) as Partner[]);
      } catch (err) {
        console.error('Failed to load partners:', err);
        if (active) setFetchError('An unexpected error occurred while loading partners.');
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchPartners();
    return () => {
      active = false;
    };
  }, []);

  // Release the preview object URL when it changes or the page unmounts.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const tierPartners = (id: PartnerTier, list: Partner[] = partners) =>
    list.filter((p) => p.tier === id).sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));

  const chooseFile = (picked: File | null) => {
    if (!picked) return;
    if (!ALLOWED_LOGO_TYPES.has(picked.type)) {
      toast.error('Logo must be a PNG, JPG or WebP image.');
      return;
    }
    if (picked.size > MAX_LOGO_BYTES) {
      toast.error('Logo must be 5 MB or smaller.');
      return;
    }
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
  };

  const resetForm = () => {
    setName('');
    setWebsite('');
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedWebsite = website.trim();

    if (!trimmedName) return toast.error('Please enter the partner name.');
    if (trimmedName.length > 100) return toast.error('Partner name is too long (max 100 characters).');
    if (trimmedWebsite && !isValidHttpUrl(trimmedWebsite)) {
      return toast.error('Website must start with http:// or https://');
    }
    if (!file) return toast.error('Please choose a logo image.');

    setAdding(true);
    const supabase = createClient();
    const path = logoPath(file.name);

    try {
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(path, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        console.error('Logo upload failed:', uploadError.message);
        toast.error('Logo upload failed.', { description: uploadError.message });
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);
      const existing = tierPartners(tier);
      const sortOrder = existing.length > 0 ? Math.max(...existing.map((p) => p.sort_order)) + 1 : 0;

      const { data, error } = await supabase
        .from('partners')
        .insert({
          name: trimmedName,
          tier,
          logo_url: publicUrl,
          storage_path: path,
          website_url: trimmedWebsite || null,
          sort_order: sortOrder,
        })
        .select()
        .single();

      if (error || !data) {
        console.error('Partner save failed:', error?.message);
        await supabase.storage.from('media').remove([path]);
        toast.error('Could not save the partner.', { description: error?.message });
        return;
      }

      setPartners((prev) => [...prev, data as Partner]);
      toast.success(`${trimmedName} added to ${partnerTierLabel(tier)}.`);
      await logAdminActivity('published', `Partner ${trimmedName} added (${tier})`);
      resetForm();
    } finally {
      setAdding(false);
    }
  };

  const updatePartner = async (partner: Partner, changes: Partial<Partner>, successMessage: string) => {
    setBusyId(partner.id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('partners')
        .update({ ...changes, updated_at: new Date().toISOString() })
        .eq('id', partner.id);

      if (error) {
        console.error('Partner update failed:', error.message);
        toast.error('Could not update the partner.', { description: error.message });
        return false;
      }
      setPartners((prev) => prev.map((p) => (p.id === partner.id ? { ...p, ...changes } : p)));
      toast.success(successMessage);
      await logAdminActivity('edited', `Partner ${partner.name}: ${successMessage}`);
      return true;
    } finally {
      setBusyId(null);
    }
  };

  const move = async (partner: Partner, direction: -1 | 1) => {
    const list = tierPartners(partner.tier);
    const from = list.findIndex((p) => p.id === partner.id);
    const to = from + direction;
    if (to < 0 || to >= list.length) return;

    // Swap the two, then renumber the tier by position so duplicate
    // sort_order values from older rows cannot make a move a no-op.
    const reordered = [...list];
    [reordered[from], reordered[to]] = [reordered[to], reordered[from]];
    const changed = reordered
      .map((p, index) => ({ p, index }))
      .filter(({ p, index }) => p.sort_order !== index);

    setBusyId(partner.id);
    try {
      const supabase = createClient();
      const results = await Promise.all(
        changed.map(({ p, index }) =>
          supabase.from('partners').update({ sort_order: index }).eq('id', p.id)
        )
      );
      const failed = results.find((r) => r.error);
      if (failed?.error) {
        toast.error('Could not reorder.', { description: failed.error.message });
        return;
      }
      const newOrder = new Map(changed.map(({ p, index }) => [p.id, index]));
      setPartners((prev) =>
        prev.map((p) => (newOrder.has(p.id) ? { ...p, sort_order: newOrder.get(p.id)! } : p))
      );
    } finally {
      setBusyId(null);
    }
  };

  const changeTier = (partner: Partner, newTier: PartnerTier) => {
    if (newTier === partner.tier) return;
    const target = tierPartners(newTier);
    const sortOrder = target.length > 0 ? Math.max(...target.map((p) => p.sort_order)) + 1 : 0;
    updatePartner(partner, { tier: newTier, sort_order: sortOrder }, `moved to ${partnerTierLabel(newTier)}`);
  };

  const openEdit = (partner: Partner) => {
    setEditing(partner);
    setEditName(partner.name);
    setEditWebsite(partner.website_url || '');
  };

  const saveEdit = async () => {
    if (!editing) return;
    const trimmedName = editName.trim();
    const trimmedWebsite = editWebsite.trim();
    if (!trimmedName) return toast.error('Partner name cannot be empty.');
    if (trimmedWebsite && !isValidHttpUrl(trimmedWebsite)) {
      return toast.error('Website must start with http:// or https://');
    }
    const ok = await updatePartner(
      editing,
      { name: trimmedName, website_url: trimmedWebsite || null },
      'details saved'
    );
    if (ok) setEditing(null);
  };

  const deletePartner = async (partner: Partner) => {
    setDeleteTarget(null);
    setBusyId(partner.id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('partners').delete().eq('id', partner.id);
      if (error) {
        toast.error('Could not delete the partner.', { description: error.message });
        return;
      }
      // Row first, then file: a leftover file is harmless, a row pointing at a
      // deleted file would show a broken logo on the homepage.
      if (partner.storage_path) {
        const { error: storageError } = await supabase.storage.from('media').remove([partner.storage_path]);
        if (storageError) console.warn('Logo file not removed:', storageError.message);
      }
      setPartners((prev) => prev.filter((p) => p.id !== partner.id));
      toast.success(`${partner.name} removed.`);
      await logAdminActivity('deleted', `Partner ${partner.name} removed`);
    } finally {
      setBusyId(null);
    }
  };

  const iconButton =
    'p-1.5 rounded text-nbac-muted hover:text-nbac-gold hover:bg-[#0b0f10] transition-colors disabled:opacity-30 disabled:hover:text-nbac-muted cursor-pointer';

  return (
    <div className="space-y-6">
      <RoleBanner />

      <div>
        <span className="font-sans text-xs uppercase tracking-widest font-semibold text-nbac-emerald-light">
          Homepage
        </span>
        <h2 className="font-display text-2xl font-bold text-nbac-text mt-1">Partners</h2>
        <p className="font-sans text-xs text-nbac-muted mt-1">
          Sponsor logos on the homepage partner wall, grouped by tier. Changes appear on the site within 5 minutes.
        </p>
      </div>

      {/* Add partner */}
      <form
        onSubmit={addPartner}
        className="bg-nbac-panel border border-nbac-border rounded-lg p-4 sm:p-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="partnerName" className={labelClass}>Partner name *</label>
            <input
              id="partnerName"
              value={name}
              maxLength={100}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Aviation"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="partnerTier" className={labelClass}>Tier *</label>
            <div className="relative">
              <select
                id="partnerTier"
                value={tier}
                onChange={(e) => setTier(e.target.value as PartnerTier)}
                className={`${inputClass} appearance-none pr-9 cursor-pointer`}
              >
                {PARTNER_TIERS.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-nbac-muted pointer-events-none" />
            </div>
          </div>
          <div>
            <label htmlFor="partnerWebsite" className={labelClass}>Website (optional)</label>
            <input
              id="partnerWebsite"
              type="url"
              value={website}
              maxLength={2048}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://"
              className={`${inputClass} font-mono`}
            />
          </div>
          <div className="sm:col-span-3">
            <span className={labelClass}>Logo *</span>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 border border-nbac-border hover:border-nbac-gold/50 text-nbac-text rounded-lg px-3 py-2 text-xs cursor-pointer transition-colors"
              >
                <ImagePlus size={14} />
                <span>{file ? 'Change logo' : 'Choose logo'}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => chooseFile(e.target.files?.[0] ?? null)}
              />
              {preview ? (
                <div className="flex items-center gap-3">
                  <div className="h-14 w-28 rounded-lg bg-white flex items-center justify-center p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="Selected logo preview" className="max-h-full max-w-full object-contain" />
                  </div>
                  <span className="text-[11px] text-nbac-muted break-all">{file?.name}</span>
                </div>
              ) : (
                <span className="text-[11px] text-nbac-muted">
                  PNG with a transparent background works best. PNG, JPG or WebP, up to 5 MB.
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={adding}
            className="w-full lg:w-auto bg-nbac-gold hover:bg-nbac-gold-light text-[#0b0f10] disabled:opacity-40 font-sans font-bold px-5 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
          >
            <Upload size={14} />
            <span>{adding ? 'Adding…' : 'Add partner'}</span>
          </button>
        </div>
      </form>

      {/* Partners by tier */}
      {loading ? (
        <div className="bg-nbac-panel border border-nbac-border rounded-lg p-12 text-center text-nbac-muted text-xs">
          Loading partners…
        </div>
      ) : fetchError ? (
        <div className="bg-nbac-panel border border-nbac-border rounded-lg p-12 text-center text-red-400 text-xs">
          {fetchError}
        </div>
      ) : (
        <div className="space-y-5">
          {PARTNER_TIERS.map((t) => {
            const list = tierPartners(t.id);
            return (
              <section key={t.id} className="bg-nbac-panel border border-nbac-border rounded-lg overflow-hidden">
                <header className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-nbac-border bg-[#0b0f10]/40">
                  <div>
                    <h3 className="font-sans text-sm font-bold text-nbac-text">{t.label}</h3>
                    <p className="text-[11px] text-nbac-muted">Shown under “{t.heading}”</p>
                  </div>
                  <span className="text-[11px] text-nbac-muted">{list.length} partner{list.length === 1 ? '' : 's'}</span>
                </header>

                {list.length === 0 ? (
                  <p className="px-5 py-6 text-xs text-nbac-muted">No {t.label} partners yet.</p>
                ) : (
                  <ul className="divide-y divide-nbac-border/40">
                    {list.map((p, index) => (
                      <li
                        key={p.id}
                        className={`flex flex-col gap-3 px-4 sm:px-5 py-3 sm:flex-row sm:items-center ${p.visible ? '' : 'opacity-60'}`}
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <div className="h-12 w-24 shrink-0 rounded-md bg-white flex items-center justify-center p-1.5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.logo_url} alt={p.name} className="max-h-full max-w-full object-contain" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-nbac-text truncate">
                              {p.name}
                              {!p.visible && <span className="ml-2 text-[10px] uppercase tracking-wider text-nbac-muted">Hidden</span>}
                            </p>
                            {p.website_url && isValidHttpUrl(p.website_url) ? (
                              <a
                                href={p.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-nbac-muted hover:text-nbac-gold break-all"
                              >
                                {p.website_url}
                                <ExternalLink size={10} />
                              </a>
                            ) : (
                              <p className="text-[11px] text-nbac-muted">No website</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <div className="relative mr-1">
                            <select
                              value={p.tier}
                              disabled={busyId === p.id}
                              onChange={(e) => changeTier(p, e.target.value as PartnerTier)}
                              aria-label={`Tier for ${p.name}`}
                              className="appearance-none bg-[#0b0f10] border border-nbac-border text-nbac-text text-base sm:text-[11px] rounded-md pl-2 pr-7 py-1.5 focus:outline-none focus:border-nbac-gold cursor-pointer"
                            >
                              {PARTNER_TIERS.map((opt) => (
                                <option key={opt.id} value={opt.id}>{opt.label}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-nbac-muted pointer-events-none" />
                          </div>
                          <button
                            onClick={() => move(p, -1)}
                            disabled={busyId === p.id || index === 0}
                            className={iconButton}
                            title="Move up"
                            aria-label={`Move ${p.name} up`}
                          >
                            <ArrowUp size={15} />
                          </button>
                          <button
                            onClick={() => move(p, 1)}
                            disabled={busyId === p.id || index === list.length - 1}
                            className={iconButton}
                            title="Move down"
                            aria-label={`Move ${p.name} down`}
                          >
                            <ArrowDown size={15} />
                          </button>
                          <button
                            onClick={() =>
                              updatePartner(p, { visible: !p.visible }, p.visible ? 'hidden from the homepage' : 'shown on the homepage')
                            }
                            disabled={busyId === p.id}
                            className={iconButton}
                            title={p.visible ? 'Hide from homepage' : 'Show on homepage'}
                            aria-label={p.visible ? `Hide ${p.name}` : `Show ${p.name}`}
                          >
                            {p.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                          </button>
                          <button
                            onClick={() => openEdit(p)}
                            disabled={busyId === p.id}
                            className={iconButton}
                            title="Edit name or website"
                            aria-label={`Edit ${p.name}`}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(p)}
                            disabled={busyId === p.id}
                            className={`${iconButton} hover:text-red-400`}
                            title="Delete"
                            aria-label={`Delete ${p.name}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* Edit modal */}
      <AccessibleModal
        isOpen={editing !== null}
        onClose={() => setEditing(null)}
        titleId="edit-partner-title"
        ariaLabel="Edit partner"
      >
        {editing && (
          <div className="space-y-5">
            <h3 id="edit-partner-title" className="font-sans text-xl font-bold text-nbac-text">
              Edit {editing.name}
            </h3>
            <div>
              <label htmlFor="editPartnerName" className={labelClass}>Partner name</label>
              <input
                id="editPartnerName"
                value={editName}
                maxLength={100}
                onChange={(e) => setEditName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="editPartnerWebsite" className={labelClass}>Website (optional)</label>
              <input
                id="editPartnerWebsite"
                type="url"
                value={editWebsite}
                maxLength={2048}
                onChange={(e) => setEditWebsite(e.target.value)}
                placeholder="https://"
                className={`${inputClass} font-mono`}
              />
            </div>
            <p className="text-[11px] text-nbac-muted">
              To replace the logo, delete this partner and add them again with the new file.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditing(null)}
                className="border border-nbac-border text-nbac-body hover:bg-nbac-panel rounded-lg px-4 py-2 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={busyId === editing.id}
                className="bg-nbac-gold hover:bg-nbac-gold-light text-[#0b0f10] disabled:opacity-40 font-bold rounded-lg px-4 py-2 text-xs uppercase tracking-wider cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </AccessibleModal>

      <AlertDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deletePartner(deleteTarget);
        }}
        title="Delete partner"
        description={`Remove "${deleteTarget?.name || 'this partner'}" and its logo from the homepage? This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
