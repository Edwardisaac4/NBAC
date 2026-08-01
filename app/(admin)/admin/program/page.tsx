'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, GripVertical, Save, X, Clock, Hash,
  MessageSquare, HelpCircle, StickyNote, Coffee, Users
} from 'lucide-react';
import { useAdminRole } from '@/hooks/use-admin-role';
import { RoleBanner } from '@/components/admin/role-banner';
import { useToast } from '@/components/shared/toast';
import { AlertDialog } from '@/components/shared/alert-dialog';
import { createClient } from '@/lib/supabase/client';
import type { ProgramSessionRow } from '@/lib/supabase/dynamic-content';
import { deleteProgramSession, upsertProgramSession } from '@/lib/supabase/dynamic-content';

const SESSION_FORMATS = [
  'panel', 'keynote', 'presentation', 'fireside',
  'networking', 'hackathon', 'ceremony', 'dinner', 'break',
] as const;

const EMPTY_SESSION: ProgramSessionRow = {
  id: '',
  day: 1,
  time_slot: '09:00',
  title: '',
  subtitle: '',
  format: 'panel',
  number: '',
  panellists: [],
  key_areas: [],
  questions: [],
  notes: '',
  is_break: false,
  sort_order: 0,
};

interface PanellistInput {
  name: string;
  organisation: string;
  role: string;
}

export default function AdminProgramPage() {
  const { isHeadAdmin } = useAdminRole();
  const toast = useToast();

  const [sessions, setSessions] = useState<ProgramSessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ProgramSessionRow | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeDay, setActiveDay] = useState<1 | 2>(1);

  // List inputs
  const [keyAreaInput, setKeyAreaInput] = useState('');
  const [questionInput, setQuestionInput] = useState('');
  const [panellistInput, setPanellistInput] = useState<PanellistInput>({ name: '', organisation: '', role: '' });

  const loadSessions = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('program_sessions')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && data) {
      setSessions(data as ProgramSessionRow[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    async function init() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('program_sessions')
        .select('*')
        .order('sort_order', { ascending: true });

      if (active) {
        if (!error && data) {
          setSessions(data as ProgramSessionRow[]);
        }
        setLoading(false);
      }
    }
    init();
    return () => {
      active = false;
    };
  }, []);

  const daySessions = sessions.filter(s => s.day === activeDay);

  const handleAddNew = () => {
    setEditing({ ...EMPTY_SESSION, id: crypto.randomUUID(), day: activeDay, sort_order: daySessions.length });
    setIsNew(true);
    resetInputs();
  };

  const handleEdit = (session: ProgramSessionRow) => {
    setEditing({ ...session });
    setIsNew(false);
    resetInputs();
  };

  const resetInputs = () => {
    setKeyAreaInput('');
    setQuestionInput('');
    setPanellistInput({ name: '', organisation: '', role: '' });
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.title.trim() || !editing.time_slot.trim()) {
      toast.error('Title and Time are required.');
      return;
    }
    setSaving(true);
    const result = await upsertProgramSession(editing);
    setSaving(false);

    if (result.success) {
      toast.success(isNew ? 'Session created.' : 'Session updated.');
      setEditing(null);
      setIsNew(false);
      loadSessions();
    } else {
      toast.error(result.error ?? 'Save failed.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const result = await deleteProgramSession(deleteTarget.id);
    if (result.success) {
      toast.success(`Deleted "${deleteTarget.title}".`);
      loadSessions();
    } else {
      toast.error(result.error ?? 'Delete failed.');
    }
    setDeleteTarget(null);
  };

  // ─── List helpers ──────────────────────────────────────────
  const handleAddKeyArea = () => {
    if (!editing || !keyAreaInput.trim()) return;
    setEditing({ ...editing, key_areas: [...editing.key_areas, keyAreaInput.trim()] });
    setKeyAreaInput('');
  };

  const handleRemoveKeyArea = (index: number) => {
    if (!editing) return;
    setEditing({ ...editing, key_areas: editing.key_areas.filter((_, i) => i !== index) });
  };

  const handleAddQuestion = () => {
    if (!editing || !questionInput.trim()) return;
    setEditing({ ...editing, questions: [...editing.questions, questionInput.trim()] });
    setQuestionInput('');
  };

  const handleRemoveQuestion = (index: number) => {
    if (!editing) return;
    setEditing({ ...editing, questions: editing.questions.filter((_, i) => i !== index) });
  };

  const handleAddPanellist = () => {
    if (!editing || !panellistInput.name.trim()) return;
    const newPanellist: { name: string; organisation?: string; role?: string } = {
      name: panellistInput.name.trim(),
    };
    if (panellistInput.organisation.trim()) newPanellist.organisation = panellistInput.organisation.trim();
    if (panellistInput.role.trim()) newPanellist.role = panellistInput.role.trim();

    setEditing({ ...editing, panellists: [...editing.panellists, newPanellist] });
    setPanellistInput({ name: '', organisation: '', role: '' });
  };

  const handleRemovePanellist = (index: number) => {
    if (!editing) return;
    setEditing({ ...editing, panellists: editing.panellists.filter((_, i) => i !== index) });
  };

  const formatBadge = (format: string) => {
    const colors: Record<string, string> = {
      panel:        'bg-blue-500/10 text-blue-400 border-blue-500/20',
      keynote:      'bg-purple-500/10 text-purple-400 border-purple-500/20',
      presentation: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      fireside:     'bg-orange-500/10 text-orange-400 border-orange-500/20',
      networking:   'bg-nbac-emerald/10 text-nbac-emerald-light border-nbac-emerald/20',
      hackathon:    'bg-nbac-gold/10 text-nbac-gold-light border-nbac-gold/20',
      ceremony:     'bg-pink-500/10 text-pink-400 border-pink-500/20',
      dinner:       'bg-amber-500/10 text-amber-400 border-amber-500/20',
      break:        'bg-gray-500/10 text-gray-400 border-gray-500/20',
    };
    return colors[format] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  };

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
            Program Manager
          </h2>
          <p className="font-sans text-xs text-nbac-muted mt-1">
            Manage conference sessions, panels, and schedule. Changes are reflected on the public program page.
          </p>
        </div>
        <button
          onClick={handleAddNew}
          disabled={editing !== null}
          className="bg-nbac-emerald hover:bg-nbac-emerald-dark disabled:opacity-40 text-white font-sans font-medium px-5 py-2.5 rounded-lg transition-all flex items-center gap-2 text-sm shadow-md shadow-nbac-emerald/10 cursor-pointer hover:scale-[1.01]"
        >
          <Plus size={16} />
          <span>Add Session</span>
        </button>
      </div>

      {/* Day Toggle */}
      <div className="flex gap-2 bg-nbac-panel border border-nbac-border rounded-lg p-1 w-fit">
        {([1, 2] as const).map(day => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`font-sans text-xs font-semibold px-5 py-2 rounded-md transition-all ${
              activeDay === day
                ? 'bg-nbac-gold/15 text-nbac-gold-light border border-nbac-gold/25'
                : 'text-nbac-muted hover:text-nbac-text border border-transparent'
            }`}
          >
            Day {day} ({sessions.filter(s => s.day === day).length})
          </button>
        ))}
      </div>

      {/* ─── Edit / Create Form ────────────────────────────────── */}
      {editing && (
        <div className="bg-nbac-panel border border-nbac-gold/20 rounded-lg p-6 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-nbac-gold-light">
              {isNew ? 'Create Session' : `Editing: ${editing.title}`}
            </h3>
            <button onClick={() => { setEditing(null); setIsNew(false); }} className="text-nbac-muted hover:text-nbac-danger transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Day */}
            <div className="space-y-1.5">
              <label className="font-sans text-xs uppercase tracking-wider font-semibold text-nbac-muted">Day</label>
              <select
                value={editing.day}
                onChange={(e) => setEditing({ ...editing, day: Number(e.target.value) })}
                className="w-full bg-nbac-canvas border border-nbac-border rounded-md px-3 py-2 font-sans text-sm text-nbac-text focus:border-nbac-gold/40 focus:outline-none transition-colors"
              >
                <option value={1}>Day 1</option>
                <option value={2}>Day 2</option>
              </select>
            </div>

            {/* Time */}
            <div className="space-y-1.5">
              <label className="font-sans text-xs uppercase tracking-wider font-semibold text-nbac-muted flex items-center gap-1.5">
                <Clock size={12} /> Time
              </label>
              <input
                type="text"
                placeholder="09:00"
                value={editing.time_slot}
                onChange={(e) => setEditing({ ...editing, time_slot: e.target.value })}
                className="w-full bg-nbac-canvas border border-nbac-border rounded-md px-3 py-2 font-sans text-sm text-nbac-text placeholder:text-nbac-muted/40 focus:border-nbac-gold/40 focus:outline-none transition-colors"
              />
            </div>

            {/* Format */}
            <div className="space-y-1.5">
              <label className="font-sans text-xs uppercase tracking-wider font-semibold text-nbac-muted">Format</label>
              <select
                value={editing.format}
                onChange={(e) => setEditing({ ...editing, format: e.target.value, is_break: ['networking', 'break'].includes(e.target.value) })}
                className="w-full bg-nbac-canvas border border-nbac-border rounded-md px-3 py-2 font-sans text-sm text-nbac-text focus:border-nbac-gold/40 focus:outline-none transition-colors"
              >
                {SESSION_FORMATS.map(f => (
                  <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Number */}
            <div className="space-y-1.5">
              <label className="font-sans text-xs uppercase tracking-wider font-semibold text-nbac-muted flex items-center gap-1.5">
                <Hash size={12} /> Session #
              </label>
              <input
                type="text"
                placeholder="01 (optional)"
                value={editing.number ?? ''}
                onChange={(e) => setEditing({ ...editing, number: e.target.value || null })}
                className="w-full bg-nbac-canvas border border-nbac-border rounded-md px-3 py-2 font-sans text-sm text-nbac-text placeholder:text-nbac-muted/40 focus:border-nbac-gold/40 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="font-sans text-xs uppercase tracking-wider font-semibold text-nbac-muted">Title</label>
            <input
              type="text"
              placeholder="Regulatory Panel"
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              className="w-full bg-nbac-canvas border border-nbac-border rounded-md px-3 py-2 font-sans text-sm text-nbac-text placeholder:text-nbac-muted/40 focus:border-nbac-gold/40 focus:outline-none transition-colors"
            />
          </div>

          {/* Subtitle */}
          <div className="space-y-1.5">
            <label className="font-sans text-xs uppercase tracking-wider font-semibold text-nbac-muted">Subtitle</label>
            <input
              type="text"
              placeholder="Strategy, Policy & Legal Frameworks..."
              value={editing.subtitle ?? ''}
              onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
              className="w-full bg-nbac-canvas border border-nbac-border rounded-md px-3 py-2 font-sans text-sm text-nbac-text placeholder:text-nbac-muted/40 focus:border-nbac-gold/40 focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Is Break */}
            <div className="flex items-center gap-3">
              <label className="font-sans text-xs uppercase tracking-wider font-semibold text-nbac-muted flex items-center gap-1.5">
                <Coffee size={12} /> Break / Non-session
              </label>
              <input
                type="checkbox"
                checked={editing.is_break}
                onChange={(e) => setEditing({ ...editing, is_break: e.target.checked })}
                className="w-4 h-4 accent-nbac-gold rounded"
              />
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

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="font-sans text-xs uppercase tracking-wider font-semibold text-nbac-muted flex items-center gap-1.5">
              <StickyNote size={12} /> Notes
            </label>
            <textarea
              rows={2}
              value={editing.notes ?? ''}
              onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
              placeholder="Additional context..."
              className="w-full bg-nbac-canvas border border-nbac-border rounded-md px-3 py-2 font-sans text-sm text-nbac-text placeholder:text-nbac-muted/40 focus:border-nbac-gold/40 focus:outline-none resize-none transition-colors"
            />
          </div>

          {/* Panellists */}
          <div className="space-y-2">
            <label className="font-sans text-xs uppercase tracking-wider font-semibold text-nbac-muted flex items-center gap-1.5">
              <Users size={12} /> Panellists ({editing.panellists.length})
            </label>
            <div className="space-y-1.5">
              {editing.panellists.map((p, i) => (
                <div key={i} className="flex items-center gap-2 bg-nbac-canvas border border-nbac-border rounded-md px-3 py-1.5 group">
                  <span className="font-sans text-xs text-nbac-body flex-1">
                    <strong className="text-nbac-text">{p.name}</strong>
                    {p.organisation && <span className="text-nbac-muted"> · {p.organisation}</span>}
                    {p.role && <span className="text-nbac-muted italic"> ({p.role})</span>}
                  </span>
                  <button onClick={() => handleRemovePanellist(i)} className="text-nbac-muted hover:text-nbac-danger transition-colors opacity-0 group-hover:opacity-100">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Name *"
                value={panellistInput.name}
                onChange={(e) => setPanellistInput({ ...panellistInput, name: e.target.value })}
                className="flex-1 bg-nbac-canvas border border-nbac-border rounded-md px-3 py-2 font-sans text-sm text-nbac-text placeholder:text-nbac-muted/40 focus:border-nbac-gold/40 focus:outline-none transition-colors"
              />
              <input
                type="text"
                placeholder="Organisation"
                value={panellistInput.organisation}
                onChange={(e) => setPanellistInput({ ...panellistInput, organisation: e.target.value })}
                className="flex-1 bg-nbac-canvas border border-nbac-border rounded-md px-3 py-2 font-sans text-sm text-nbac-text placeholder:text-nbac-muted/40 focus:border-nbac-gold/40 focus:outline-none transition-colors"
              />
              <input
                type="text"
                placeholder="Role"
                value={panellistInput.role}
                onChange={(e) => setPanellistInput({ ...panellistInput, role: e.target.value })}
                className="flex-1 bg-nbac-canvas border border-nbac-border rounded-md px-3 py-2 font-sans text-sm text-nbac-text placeholder:text-nbac-muted/40 focus:border-nbac-gold/40 focus:outline-none transition-colors"
              />
              <button
                onClick={handleAddPanellist}
                disabled={!panellistInput.name.trim()}
                className="bg-nbac-gold/10 border border-nbac-gold/20 text-nbac-gold-light hover:bg-nbac-gold/20 disabled:opacity-30 font-sans text-xs font-medium px-4 py-2 rounded-md transition-colors whitespace-nowrap"
              >
                Add
              </button>
            </div>
          </div>

          {/* Key Areas */}
          <div className="space-y-2">
            <label className="font-sans text-xs uppercase tracking-wider font-semibold text-nbac-muted flex items-center gap-1.5">
              <MessageSquare size={12} /> Key Discussion Areas ({editing.key_areas.length})
            </label>
            <div className="space-y-1.5">
              {editing.key_areas.map((area, i) => (
                <div key={i} className="flex items-center gap-2 bg-nbac-canvas border border-nbac-border rounded-md px-3 py-1.5 group">
                  <span className="font-sans text-xs text-nbac-body flex-1">{area}</span>
                  <button onClick={() => handleRemoveKeyArea(i)} className="text-nbac-muted hover:text-nbac-danger transition-colors opacity-0 group-hover:opacity-100">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add key discussion area..."
                value={keyAreaInput}
                onChange={(e) => setKeyAreaInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddKeyArea(); } }}
                className="flex-1 bg-nbac-canvas border border-nbac-border rounded-md px-3 py-2 font-sans text-sm text-nbac-text placeholder:text-nbac-muted/40 focus:border-nbac-gold/40 focus:outline-none transition-colors"
              />
              <button
                onClick={handleAddKeyArea}
                disabled={!keyAreaInput.trim()}
                className="bg-nbac-gold/10 border border-nbac-gold/20 text-nbac-gold-light hover:bg-nbac-gold/20 disabled:opacity-30 font-sans text-xs font-medium px-4 py-2 rounded-md transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-2">
            <label className="font-sans text-xs uppercase tracking-wider font-semibold text-nbac-muted flex items-center gap-1.5">
              <HelpCircle size={12} /> Panel Questions ({editing.questions.length})
            </label>
            <div className="space-y-1.5">
              {editing.questions.map((q, i) => (
                <div key={i} className="flex items-center gap-2 bg-nbac-canvas border border-nbac-border rounded-md px-3 py-1.5 group">
                  <span className="font-sans text-xs text-nbac-body flex-1">{q}</span>
                  <button onClick={() => handleRemoveQuestion(i)} className="text-nbac-muted hover:text-nbac-danger transition-colors opacity-0 group-hover:opacity-100">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add panel question..."
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddQuestion(); } }}
                className="flex-1 bg-nbac-canvas border border-nbac-border rounded-md px-3 py-2 font-sans text-sm text-nbac-text placeholder:text-nbac-muted/40 focus:border-nbac-gold/40 focus:outline-none transition-colors"
              />
              <button
                onClick={handleAddQuestion}
                disabled={!questionInput.trim()}
                className="bg-nbac-gold/10 border border-nbac-gold/20 text-nbac-gold-light hover:bg-nbac-gold/20 disabled:opacity-30 font-sans text-xs font-medium px-4 py-2 rounded-md transition-colors"
              >
                Add
              </button>
            </div>
          </div>

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
              <span>{saving ? 'Saving…' : 'Save Session'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── Sessions Table ────────────────────────────────────── */}
      <div className="bg-nbac-panel border border-nbac-border rounded-lg overflow-hidden select-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-nbac-border bg-[#0b0f10]/30 font-sans text-xs uppercase tracking-wider font-semibold text-nbac-muted">
                <th className="p-4 pl-6 w-10">#</th>
                <th className="p-4 w-20">Time</th>
                <th className="p-4">Session</th>
                <th className="p-4 w-28">Format</th>
                <th className="p-4 w-24">Panellists</th>
                <th className="p-4 pr-6 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nbac-border font-sans text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-nbac-muted font-sans text-xs">
                    Loading program sessions…
                  </td>
                </tr>
              ) : daySessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-nbac-muted font-sans text-xs">
                    No sessions found for Day {activeDay}. The public site will fall back to hardcoded defaults.
                    <br />
                    Click &quot;Add Session&quot; to create your first dynamic session.
                  </td>
                </tr>
              ) : (
                daySessions.map((session, idx) => (
                  <tr key={session.id} className={`hover:bg-nbac-canvas/40 transition-colors ${session.is_break ? 'opacity-60' : ''}`}>
                    <td className="p-4 pl-6 text-nbac-muted font-mono text-xs">
                      {session.number ?? (idx + 1)}
                    </td>
                    <td className="p-4 font-mono text-xs text-nbac-gold-light font-semibold">
                      {session.time_slot}
                    </td>
                    <td className="p-4">
                      <div>
                        <span className={`font-medium ${session.is_break ? 'text-nbac-muted' : 'text-nbac-text'}`}>
                          {session.title}
                        </span>
                      </div>
                      {session.subtitle && (
                        <span className="text-nbac-muted text-xs block mt-0.5 max-w-md truncate">{session.subtitle}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${formatBadge(session.format)}`}>
                        {session.format}
                      </span>
                    </td>
                    <td className="p-4 text-nbac-muted text-xs text-center">
                      {session.panellists?.length ?? 0}
                    </td>
                    <td className="p-4 pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(session)}
                          disabled={editing !== null}
                          className="text-nbac-muted hover:text-nbac-gold-light disabled:opacity-30 transition-colors p-1.5 rounded hover:bg-nbac-gold/5"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        {isHeadAdmin && (
                          <button
                            onClick={() => setDeleteTarget({ id: session.id, title: session.title })}
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
        title="Delete Session"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
