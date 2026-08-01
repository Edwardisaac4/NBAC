'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, GripVertical, Save, X, DollarSign, Tag, Megaphone, Mic, Globe } from 'lucide-react';
import { useAdminRole } from '@/hooks/use-admin-role';
import { RoleBanner } from '@/components/admin/role-banner';
import { useToast } from '@/components/shared/toast';
import { AlertDialog } from '@/components/shared/alert-dialog';
import { createClient } from '@/lib/supabase/client';
import type { SponsorTierRow } from '@/lib/supabase/dynamic-content';
import { deleteSponsorTier, upsertSponsorTier } from '@/lib/supabase/dynamic-content';

const EMPTY_TIER: SponsorTierRow = {
  id: '',
  name: '',
  price: 0,
  currency: 'USD',
  badge: '',
  description: '',
  branding_privileges: [],
  speaking_privileges: [],
  digital_privileges: [],
  availability: 'available',
  sort_order: 0,
};

type PrivilegeCategory = 'branding_privileges' | 'speaking_privileges' | 'digital_privileges';

const PRIVILEGE_META: { key: PrivilegeCategory; label: string; icon: React.ReactNode }[] = [
  { key: 'branding_privileges',  label: 'Branding Privileges',  icon: <Megaphone size={12} /> },
  { key: 'speaking_privileges',  label: 'Speaking Privileges',  icon: <Mic size={12} /> },
  { key: 'digital_privileges',   label: 'Digital Privileges',   icon: <Globe size={12} /> },
];

export default function AdminSponsorsManagerPage() {
  const { isHeadAdmin } = useAdminRole();
  const toast = useToast();

  const [tiers, setTiers] = useState<SponsorTierRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SponsorTierRow | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [privilegeInputs, setPrivilegeInputs] = useState<Record<PrivilegeCategory, string>>({
    branding_privileges: '',
    speaking_privileges: '',
    digital_privileges: '',
  });

  const loadTiers = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('sponsor_tiers_db')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && data) {
      setTiers(data as SponsorTierRow[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    async function init() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('sponsor_tiers_db')
        .select('*')
        .order('sort_order', { ascending: true });

      if (active) {
        if (!error && data) {
          setTiers(data as SponsorTierRow[]);
        }
        setLoading(false);
      }
    }
    init();
    return () => {
      active = false;
    };
  }, []);

  const handleAddNew = () => {
    setEditing({ ...EMPTY_TIER, sort_order: tiers.length });
    setIsNew(true);
    setPrivilegeInputs({ branding_privileges: '', speaking_privileges: '', digital_privileges: '' });
  };

  const handleEdit = (tier: SponsorTierRow) => {
    setEditing({ ...tier });
    setIsNew(false);
    setPrivilegeInputs({ branding_privileges: '', speaking_privileges: '', digital_privileges: '' });
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.id.trim() || !editing.name.trim() || !editing.description.trim()) {
      toast.error('Tier ID, Name, and Description are required.');
      return;
    }
    setSaving(true);
    const result = await upsertSponsorTier(editing);
    setSaving(false);

    if (result.success) {
      toast.success(isNew ? 'Sponsor tier created.' : 'Sponsor tier updated.');
      setEditing(null);
      setIsNew(false);
      loadTiers();
    } else {
      toast.error(result.error ?? 'Save failed.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const result = await deleteSponsorTier(deleteTarget.id);
    if (result.success) {
      toast.success(`Deleted "${deleteTarget.name}".`);
      loadTiers();
    } else {
      toast.error(result.error ?? 'Delete failed.');
    }
    setDeleteTarget(null);
  };

  const handleAddPrivilege = (category: PrivilegeCategory) => {
    if (!editing || !privilegeInputs[category].trim()) return;
    setEditing({
      ...editing,
      [category]: [...editing[category], privilegeInputs[category].trim()],
    });
    setPrivilegeInputs({ ...privilegeInputs, [category]: '' });
  };

  const handleRemovePrivilege = (category: PrivilegeCategory, index: number) => {
    if (!editing) return;
    const updated = editing[category].filter((_, i) => i !== index);
    setEditing({ ...editing, [category]: updated });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
  };

  const totalPrivileges = (tier: SponsorTierRow) =>
    tier.branding_privileges.length + tier.speaking_privileges.length + tier.digital_privileges.length;

  return (
    <div className="space-y-6">
      <RoleBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="font-sans text-xs uppercase tracking-widest font-semibold text-nbac-emerald-light">
            Dynamic Content
          </span>
          <h2 className="font-display text-2xl font-bold text-nbac-text mt-1">
            Sponsor Packages
          </h2>
          <p className="font-sans text-xs text-nbac-muted mt-1">
            Manage sponsorship tiers, pricing, and privilege breakdowns. Changes are reflected on the public sponsors page.
          </p>
        </div>
        <button
          onClick={handleAddNew}
          disabled={editing !== null}
          className="bg-nbac-emerald hover:bg-nbac-emerald-dark disabled:opacity-40 text-white font-sans font-medium px-5 py-2.5 rounded-lg transition-all flex items-center gap-2 text-sm shadow-md shadow-nbac-emerald/10 cursor-pointer hover:scale-[1.01]"
        >
          <Plus size={16} />
          <span>Add Tier</span>
        </button>
      </div>

      {/* ─── Edit / Create Form ────────────────────────────────── */}
      {editing && (
        <div className="bg-nbac-panel border border-nbac-gold/20 rounded-lg p-6 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-nbac-gold-light">
              {isNew ? 'Create Sponsor Tier' : `Editing: ${editing.name}`}
            </h3>
            <button onClick={() => { setEditing(null); setIsNew(false); }} className="text-nbac-muted hover:text-nbac-danger transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Tier ID */}
            <div className="space-y-1.5">
              <label className="font-sans text-xs uppercase tracking-wider font-semibold text-nbac-muted flex items-center gap-1.5">
                <Tag size={12} /> Tier ID
              </label>
              <input
                type="text"
                placeholder="e.g. platinum"
                value={editing.id}
                disabled={!isNew}
                onChange={(e) => setEditing({ ...editing, id: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                className="w-full bg-nbac-canvas border border-nbac-border rounded-md px-3 py-2 font-sans text-sm text-nbac-text placeholder:text-nbac-muted/40 focus:border-nbac-gold/40 focus:outline-none disabled:opacity-50 transition-colors"
              />
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="font-sans text-xs uppercase tracking-wider font-semibold text-nbac-muted">Name</label>
              <input
                type="text"
                placeholder="Platinum Sponsor"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="w-full bg-nbac-canvas border border-nbac-border rounded-md px-3 py-2 font-sans text-sm text-nbac-text placeholder:text-nbac-muted/40 focus:border-nbac-gold/40 focus:outline-none transition-colors"
              />
            </div>

            {/* Badge */}
            <div className="space-y-1.5">
              <label className="font-sans text-xs uppercase tracking-wider font-semibold text-nbac-muted">Badge Label</label>
              <input
                type="text"
                placeholder="Premium Partner"
                value={editing.badge ?? ''}
                onChange={(e) => setEditing({ ...editing, badge: e.target.value })}
                className="w-full bg-nbac-canvas border border-nbac-border rounded-md px-3 py-2 font-sans text-sm text-nbac-text placeholder:text-nbac-muted/40 focus:border-nbac-gold/40 focus:outline-none transition-colors"
              />
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <label className="font-sans text-xs uppercase tracking-wider font-semibold text-nbac-muted flex items-center gap-1.5">
                <DollarSign size={12} /> Price (USD)
              </label>
              <input
                type="number"
                min={0}
                value={editing.price}
                onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                className="w-full bg-nbac-canvas border border-nbac-border rounded-md px-3 py-2 font-sans text-sm text-nbac-text focus:border-nbac-gold/40 focus:outline-none transition-colors"
              />
            </div>

            {/* Availability */}
            <div className="space-y-1.5">
              <label className="font-sans text-xs uppercase tracking-wider font-semibold text-nbac-muted">Availability</label>
              <select
                value={editing.availability}
                onChange={(e) => setEditing({ ...editing, availability: e.target.value })}
                className="w-full bg-nbac-canvas border border-nbac-border rounded-md px-3 py-2 font-sans text-sm text-nbac-text focus:border-nbac-gold/40 focus:outline-none transition-colors"
              >
                <option value="available">Available</option>
                <option value="limited">Limited</option>
                <option value="sold_out">Sold Out</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="space-y-1.5">
              <label className="font-sans text-xs uppercase tracking-wider font-semibold text-nbac-muted flex items-center gap-1.5">
                <GripVertical size={12} /> Sort Order
              </label>
              <input
                type="number"
                min={0}
                value={editing.sort_order}
                onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                className="w-full bg-nbac-canvas border border-nbac-border rounded-md px-3 py-2 font-sans text-sm text-nbac-text focus:border-nbac-gold/40 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-sans text-xs uppercase tracking-wider font-semibold text-nbac-muted">Description</label>
            <textarea
              rows={2}
              value={editing.description}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              placeholder="What this sponsorship tier represents..."
              className="w-full bg-nbac-canvas border border-nbac-border rounded-md px-3 py-2 font-sans text-sm text-nbac-text placeholder:text-nbac-muted/40 focus:border-nbac-gold/40 focus:outline-none resize-none transition-colors"
            />
          </div>

          {/* Privilege Categories */}
          {PRIVILEGE_META.map(({ key, label, icon }) => (
            <div key={key} className="space-y-2">
              <label className="font-sans text-xs uppercase tracking-wider font-semibold text-nbac-muted flex items-center gap-1.5">
                {icon} {label} ({editing[key].length})
              </label>
              <div className="space-y-1.5">
                {editing[key].map((priv, i) => (
                  <div key={i} className="flex items-center gap-2 bg-nbac-canvas border border-nbac-border rounded-md px-3 py-1.5 group">
                    <span className="font-sans text-xs text-nbac-body flex-1">{priv}</span>
                    <button
                      onClick={() => handleRemovePrivilege(key, i)}
                      className="text-nbac-muted hover:text-nbac-danger transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Add ${label.toLowerCase().replace(' privileges', '')} privilege...`}
                  value={privilegeInputs[key]}
                  onChange={(e) => setPrivilegeInputs({ ...privilegeInputs, [key]: e.target.value })}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddPrivilege(key); } }}
                  className="flex-1 bg-nbac-canvas border border-nbac-border rounded-md px-3 py-2 font-sans text-sm text-nbac-text placeholder:text-nbac-muted/40 focus:border-nbac-gold/40 focus:outline-none transition-colors"
                />
                <button
                  onClick={() => handleAddPrivilege(key)}
                  disabled={!privilegeInputs[key].trim()}
                  className="bg-nbac-gold/10 border border-nbac-gold/20 text-nbac-gold-light hover:bg-nbac-gold/20 disabled:opacity-30 font-sans text-xs font-medium px-4 py-2 rounded-md transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          ))}

          {/* Save */}
          <div className="flex justify-end gap-3 pt-2 border-t border-nbac-border">
            <button
              onClick={() => { setEditing(null); setIsNew(false); }}
              className="font-sans text-xs font-medium text-nbac-muted hover:text-nbac-text px-4 py-2 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-nbac-emerald hover:bg-nbac-emerald-dark disabled:opacity-50 text-white font-sans font-medium px-6 py-2.5 rounded-lg transition-all flex items-center gap-2 text-sm"
            >
              <Save size={14} />
              <span>{saving ? 'Saving…' : 'Save Tier'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── Tiers Table ───────────────────────────────────────── */}
      <div className="bg-nbac-panel border border-nbac-border rounded-lg overflow-hidden select-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-nbac-border bg-[#0b0f10]/30 font-sans text-xs uppercase tracking-wider font-semibold text-nbac-muted">
                <th className="p-4 pl-6 w-10">#</th>
                <th className="p-4">Tier</th>
                <th className="p-4">Price</th>
                <th className="p-4">Availability</th>
                <th className="p-4">Privileges</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nbac-border font-sans text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-nbac-muted font-sans text-xs">
                    Loading sponsor tiers…
                  </td>
                </tr>
              ) : tiers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-nbac-muted font-sans text-xs">
                    No sponsor tiers found. The public site will fall back to hardcoded defaults.
                    <br />
                    Click &quot;Add Tier&quot; to create your first dynamic tier.
                  </td>
                </tr>
              ) : (
                tiers.map((tier, idx) => (
                  <tr key={tier.id} className="hover:bg-nbac-canvas/40 transition-colors">
                    <td className="p-4 pl-6 text-nbac-muted font-mono text-xs">{idx + 1}</td>
                    <td className="p-4">
                      <div>
                        <span className="font-medium text-nbac-text">{tier.name}</span>
                        {tier.badge && (
                          <span className="ml-2 px-2 py-0.5 bg-nbac-gold/10 border border-nbac-gold/20 rounded text-[10px] font-semibold text-nbac-gold-light uppercase tracking-wider">
                            {tier.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-nbac-muted text-xs">{tier.description.slice(0, 60)}{tier.description.length > 60 ? '…' : ''}</span>
                    </td>
                    <td className="p-4 text-nbac-emerald-light font-semibold">{formatCurrency(tier.price)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        tier.availability === 'available'
                          ? 'bg-nbac-emerald/10 text-nbac-emerald-light border border-nbac-emerald/20'
                          : tier.availability === 'limited'
                            ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {tier.availability.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-nbac-muted text-xs">{totalPrivileges(tier)} items</td>
                    <td className="p-4 pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(tier)}
                          disabled={editing !== null}
                          className="text-nbac-muted hover:text-nbac-gold-light disabled:opacity-30 transition-colors p-1.5 rounded hover:bg-nbac-gold/5"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        {isHeadAdmin && (
                          <button
                            onClick={() => setDeleteTarget({ id: tier.id, name: tier.name })}
                            disabled={editing !== null}
                            className="text-nbac-muted hover:text-nbac-danger disabled:opacity-30 transition-colors p-1.5 rounded hover:bg-red-500/5"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Delete Confirmation ───────────────────────────────── */}
      <AlertDialog
        isOpen={deleteTarget !== null}
        title="Delete Sponsor Tier"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
