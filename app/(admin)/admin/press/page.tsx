'use client';

import React, { useState, useEffect } from 'react';
import {
  FileDown,
  Search,
  Filter,
  ArrowUpRight,
  Newspaper,
  Clock,
  BadgeCheck,
  CalendarClock,
  ChevronDown,
  Check,
  X,
  RotateCcw,
} from 'lucide-react';
import { useAdminRole } from '@/hooks/use-admin-role';
import { RoleBanner } from '@/components/admin/role-banner';
import { KpiCard } from '@/components/admin/kpi-card';
import { AccessibleModal } from '@/components/shared/accessible-modal';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/shared/toast';
import { logAdminActivity } from '@/lib/admin-logger';
import { isValidHttpUrl } from '@/lib/utils';
import { MEDIA_TYPES, mediaTypeLabel, type PressStatus } from '@/lib/press';

interface PressAccreditation {
  id: string;
  reference: string;
  full_name: string;
  email: string;
  phone: string;
  job_title: string;
  outlet: string;
  media_type: string;
  country: string | null;
  outlet_website: string | null;
  coverage_plan: string | null;
  additional_crew: string | null;
  consent: boolean;
  status: PressStatus;
  reviewed_at: string | null;
  created_at: string;
}

const getCsvFilename = () => `nbac_press_accreditations_${new Date().toISOString().slice(0, 10)}.csv`;

const STATUS_LABEL: Record<PressStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  declined: 'Declined',
};

function StatusBadge({ status }: { status: PressStatus }) {
  const styles: Record<PressStatus, string> = {
    pending: 'bg-nbac-gold/10 border-nbac-gold/25 text-nbac-gold-light',
    approved: 'bg-nbac-emerald/10 border-nbac-emerald/20 text-nbac-emerald-light',
    declined: 'bg-red-500/10 border-red-500/25 text-red-400',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded border font-semibold text-[10px] uppercase tracking-wider ${styles[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

function SafeLink({ url }: { url: string | null }) {
  if (!url) return <span className="text-nbac-text">—</span>;
  // Submitted URLs are validated server-side, but never render an unchecked
  // href from form input — a javascript: URL here would run in the admin session.
  if (!isValidHttpUrl(url)) return <span className="text-nbac-text break-all">{url}</span>;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="text-nbac-text hover:text-nbac-gold break-all">
      {url}
    </a>
  );
}

export default function PressAccreditationsPage() {
  useAdminRole();
  const toast = useToast();

  const [requests, setRequests] = useState<PressAccreditation[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selected, setSelected] = useState<PressAccreditation | null>(null);
  const [updating, setUpdating] = useState(false);
  const [notifyByEmail, setNotifyByEmail] = useState(true);
  const [decisionNote, setDecisionNote] = useState('');
  const [recentCount, setRecentCount] = useState(0);

  // A note typed for one journalist must never carry over to the next.
  const openRequest = (request: PressAccreditation) => {
    setSelected(request);
    setNotifyByEmail(true);
    setDecisionNote('');
  };

  useEffect(() => {
    let active = true;

    async function fetchRequests() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('press_accreditations')
          .select('*')
          .order('created_at', { ascending: false });

        if (!active) return;

        if (error) {
          console.error('Failed to fetch press accreditations:', error.message);
          setFetchError(
            error.code === 'PGRST205' || error.code === '42P01'
              ? 'The press_accreditations table does not exist yet. Apply migration 009 in Supabase.'
              : 'Could not load accreditation requests. Please refresh or check your access level.'
          );
          return;
        }

        const rows = (data || []) as PressAccreditation[];

        // Computed here rather than during render: Date.now() is impure.
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        setRecentCount(
          rows.filter((row) => new Date(row.created_at).getTime() >= sevenDaysAgo).length
        );
        setRequests(rows);
      } catch (err) {
        console.error('Failed to load press accreditations:', err);
        if (active) setFetchError('An unexpected error occurred while loading requests.');
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchRequests();
    return () => {
      active = false;
    };
  }, []);

  const updateStatus = async (request: PressAccreditation, status: PressStatus) => {
    if (request.status === status) return;
    const notify = notifyByEmail && status !== 'pending';
    setUpdating(true);
    try {
      // Goes through the server route rather than a direct table update:
      // the decision email has to be sent server-side, with the Resend key.
      const response = await fetch('/api/admin/press/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: request.id, status, notify, note: decisionNote }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.error || 'Could not update the status. Please try again.');
        return;
      }

      const updated = { ...request, status: data.status as PressStatus, reviewed_at: data.reviewed_at };
      setRequests((prev) => prev.map((r) => (r.id === request.id ? updated : r)));
      setSelected(updated);
      setDecisionNote('');

      const label = STATUS_LABEL[status].toLowerCase();
      if (!notify) {
        toast.success(`${request.full_name} marked as ${label}.`);
      } else if (data.emailed) {
        toast.success(`${request.full_name} ${label} and emailed at ${request.email}.`);
      } else {
        toast.error(
          `${request.full_name} marked as ${label}, but the email failed to send. Contact them directly.`
        );
      }
      await logAdminActivity(
        'edited',
        `Press accreditation ${request.reference} set to ${status}${notify ? (data.emailed ? ' (emailed)' : ' (email failed)') : ''}`
      );
    } catch (err) {
      console.error('Failed to update accreditation status:', err);
      toast.error('Could not update the status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = requests.filter((r) => {
    const term = search.trim().toLowerCase();
    const matchesSearch =
      term === '' ||
      r.full_name.toLowerCase().includes(term) ||
      r.email.toLowerCase().includes(term) ||
      r.outlet.toLowerCase().includes(term) ||
      r.reference.toLowerCase().includes(term) ||
      (r.phone || '').toLowerCase().includes(term);

    const matchesStatus = selectedStatus === 'all' || r.status === selectedStatus;
    const matchesType = selectedType === 'all' || r.media_type === selectedType;

    return matchesSearch && matchesStatus && matchesType;
  });

  // KPI aggregation across every request, not just the filtered view
  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const approvedCount = requests.filter((r) => r.status === 'approved').length;

  const exportCsv = () => {
    if (filtered.length === 0) {
      toast.error('No requests available to export.');
      return;
    }

    const headers = [
      'Submitted At',
      'Reference',
      'Status',
      'Full Name',
      'Job Title',
      'Media Outlet',
      'Media Type',
      'Country',
      'Email',
      'Phone',
      'Outlet Website',
      'Coverage Plan',
      'Additional Crew',
      'Reviewed At',
    ];

    // Guard against CSV formula injection in spreadsheet apps
    const csvCell = (value: unknown) => {
      const text = value === null || value === undefined ? '' : String(value);
      const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
      return `"${safe.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
    };

    const rows = filtered.map((r) => [
      csvCell(new Date(r.created_at).toISOString()),
      csvCell(r.reference),
      csvCell(STATUS_LABEL[r.status]),
      csvCell(r.full_name),
      csvCell(r.job_title),
      csvCell(r.outlet),
      csvCell(mediaTypeLabel(r.media_type)),
      csvCell(r.country),
      csvCell(r.email),
      csvCell(r.phone),
      csvCell(r.outlet_website),
      csvCell(r.coverage_plan),
      csvCell(r.additional_crew),
      csvCell(r.reviewed_at ? new Date(r.reviewed_at).toISOString() : ''),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = getCsvFilename();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${filtered.length} accreditation requests to CSV.`);
  };

  return (
    <div className="space-y-6">
      <RoleBanner />

      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-sans text-xs uppercase tracking-widest font-semibold text-nbac-emerald-light">
            Media Desk
          </span>
          <h2 className="font-display text-2xl font-bold text-nbac-text mt-1">
            Press Accreditation
          </h2>
          <p className="font-sans text-xs text-nbac-muted mt-1">
            Every journalist and media accreditation request. Review, approve or decline, and export to CSV.
          </p>
        </div>

        <button
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="bg-nbac-gold hover:bg-nbac-gold-light text-[#0b0f10] disabled:opacity-40 font-sans font-bold px-5 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
        >
          <FileDown size={16} />
          <span>Export CSV ({filtered.length})</span>
        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Total Requests" value={requests.length} icon={Newspaper} highlight />
        <KpiCard title="Pending Review" value={pendingCount} icon={Clock} />
        <KpiCard title="Approved" value={approvedCount} icon={BadgeCheck} />
        <KpiCard title="Last 7 Days" value={recentCount} icon={CalendarClock} />
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col gap-3 bg-nbac-panel border border-nbac-border rounded-lg p-3 sm:gap-4 sm:p-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-nbac-muted pointer-events-none" />
          {/* 16px type on mobile keeps iOS from zooming the page in on focus */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, outlet or reference..."
            className="w-full bg-[#0b0f10] border border-nbac-border focus:border-nbac-gold rounded-lg pl-10 pr-4 py-2.5 text-base sm:text-xs text-nbac-text focus:outline-none transition-colors"
          />
        </div>

        <div className="grid w-full shrink-0 grid-cols-1 gap-2 sm:grid-cols-2 md:flex md:w-auto md:items-center">
          <Filter className="hidden w-4 h-4 shrink-0 text-nbac-muted md:block" />

          <div className="relative min-w-0">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter by status"
              className="w-full appearance-none truncate bg-[#0b0f10] border border-nbac-border text-nbac-text text-base sm:text-xs rounded-lg pl-3 pr-9 py-2.5 focus:outline-none focus:border-nbac-gold cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="declined">Declined</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-nbac-muted pointer-events-none" />
          </div>

          <div className="relative min-w-0">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              aria-label="Filter by media type"
              className="w-full appearance-none truncate bg-[#0b0f10] border border-nbac-border text-nbac-text text-base sm:text-xs rounded-lg pl-3 pr-9 py-2.5 focus:outline-none focus:border-nbac-gold cursor-pointer"
            >
              <option value="all">All Media Types</option>
              {MEDIA_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-nbac-muted pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-nbac-panel border border-nbac-border rounded-lg overflow-hidden select-none">
        {loading ? (
          <div className="p-12 text-center text-nbac-muted font-sans text-xs">
            Loading accreditation requests…
          </div>
        ) : fetchError ? (
          <div className="p-12 text-center text-red-400 font-sans text-xs">{fetchError}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-nbac-muted font-sans text-xs">
            {requests.length === 0
              ? 'No accreditation requests have been received yet.'
              : 'No requests match your filters.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-nbac-border bg-[#0b0f10]/40 text-nbac-muted uppercase tracking-wider font-semibold text-[11px]">
                  <th className="p-4 pl-6">Journalist</th>
                  <th className="p-4">Outlet</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Submitted</th>
                  <th className="p-4 pr-6 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nbac-border/40 text-nbac-body">
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => openRequest(r)}
                    className="hover:bg-nbac-panel/60 transition-colors cursor-pointer"
                  >
                    <td className="p-4 pl-6">
                      <div className="font-bold text-nbac-text">{r.full_name}</div>
                      <div className="text-nbac-muted text-[11px]">{r.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-nbac-text">{r.outlet}</div>
                      <div className="text-nbac-muted text-[11px]">{mediaTypeLabel(r.media_type)}</div>
                    </td>
                    <td className="p-4">{r.job_title}</td>
                    <td className="p-4"><StatusBadge status={r.status} /></td>
                    <td className="p-4 font-mono font-semibold text-nbac-gold whitespace-nowrap">{r.reference}</td>
                    <td className="p-4 text-nbac-muted">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openRequest(r);
                        }}
                        className="p-1.5 rounded text-nbac-muted hover:text-nbac-gold hover:bg-nbac-panel transition-colors"
                        title="View Full Request"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AccessibleModal
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
        titleId="selected-press-title"
        ariaLabel="Press Accreditation Details"
      >
        {selected && (
          <div>
            {/* Header */}
            <div className="border-b border-nbac-border/60 pb-5 mb-5">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <StatusBadge status={selected.status} />
                <span className="font-mono text-xs font-bold text-nbac-gold bg-nbac-gold/10 px-2.5 py-0.5 rounded border border-nbac-gold/20">
                  {selected.reference}
                </span>
              </div>
              <h3
                id="selected-press-title"
                className="font-sans text-2xl font-bold text-nbac-text leading-tight"
              >
                {selected.full_name}
              </h3>
              <p className="text-xs text-nbac-muted font-medium mt-1">
                {selected.job_title} · {selected.outlet}
              </p>
            </div>

            <div className="space-y-6">
              {/* Decision email */}
              <div className="space-y-3 rounded-xl border border-nbac-border/60 bg-[#12181a] p-4">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-nbac-text">
                  <input
                    type="checkbox"
                    checked={notifyByEmail}
                    onChange={(e) => setNotifyByEmail(e.target.checked)}
                    className="h-4 w-4 shrink-0 accent-[#c5a059] cursor-pointer"
                  />
                  <span>Email {selected.full_name.split(' ')[0]} when I approve or decline</span>
                </label>
                {notifyByEmail && (
                  <div>
                    <label
                      htmlFor="decisionNote"
                      className="block text-nbac-muted uppercase tracking-wider text-[10px] mb-1.5"
                    >
                      Message to include (optional)
                    </label>
                    {/* 16px type on mobile keeps iOS from zooming the page in on focus */}
                    <textarea
                      id="decisionNote"
                      rows={3}
                      maxLength={1000}
                      value={decisionNote}
                      onChange={(e) => setDecisionNote(e.target.value)}
                      placeholder="e.g. badge collection details, or a reason for declining"
                      className="w-full bg-[#0b0f10] border border-nbac-border focus:border-nbac-gold rounded-lg px-3 py-2.5 text-base sm:text-xs text-nbac-text focus:outline-none transition-colors leading-relaxed"
                    />
                  </div>
                )}
              </div>

              {/* Review actions */}
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={() => updateStatus(selected, 'approved')}
                  disabled={updating || selected.status === 'approved'}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-nbac-emerald hover:bg-nbac-emerald-dark disabled:opacity-40 text-white font-sans font-bold text-xs uppercase tracking-wider px-4 py-2.5 transition-colors cursor-pointer"
                >
                  <Check size={14} />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => updateStatus(selected, 'declined')}
                  disabled={updating || selected.status === 'declined'}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-40 font-sans font-bold text-xs uppercase tracking-wider px-4 py-2.5 transition-colors cursor-pointer"
                >
                  <X size={14} />
                  <span>Decline</span>
                </button>
                {selected.status !== 'pending' && (
                  <button
                    onClick={() => updateStatus(selected, 'pending')}
                    disabled={updating}
                    className="flex items-center justify-center gap-2 rounded-lg border border-nbac-border text-nbac-body hover:bg-nbac-panel disabled:opacity-40 font-sans font-medium text-xs px-4 py-2.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw size={14} />
                    <span>Reset</span>
                  </button>
                )}
              </div>
              {selected.reviewed_at && (
                <p className="-mt-3 text-[11px] text-nbac-muted">
                  {STATUS_LABEL[selected.status]} on {new Date(selected.reviewed_at).toLocaleString()}
                </p>
              )}

              {/* Meta grid */}
              <div className="grid grid-cols-1 gap-4 bg-[#12181a] border border-nbac-border/60 rounded-xl p-4 text-xs sm:grid-cols-2">
                <div>
                  <span className="block text-nbac-muted uppercase tracking-wider text-[10px] mb-1">Email</span>
                  <a href={`mailto:${selected.email}`} className="text-nbac-text hover:text-nbac-gold break-all">
                    {selected.email}
                  </a>
                </div>
                <div>
                  <span className="block text-nbac-muted uppercase tracking-wider text-[10px] mb-1">Phone / WhatsApp</span>
                  <a href={`tel:${selected.phone}`} className="text-nbac-text hover:text-nbac-gold">
                    {selected.phone}
                  </a>
                </div>
                <div>
                  <span className="block text-nbac-muted uppercase tracking-wider text-[10px] mb-1">Media Type</span>
                  <span className="text-nbac-text">{mediaTypeLabel(selected.media_type)}</span>
                </div>
                <div>
                  <span className="block text-nbac-muted uppercase tracking-wider text-[10px] mb-1">Country</span>
                  <span className="text-nbac-text">{selected.country || '—'}</span>
                </div>
                <div>
                  <span className="block text-nbac-muted uppercase tracking-wider text-[10px] mb-1">Submitted</span>
                  <span className="text-nbac-text">{new Date(selected.created_at).toLocaleString()}</span>
                </div>
                <div>
                  <span className="block text-nbac-muted uppercase tracking-wider text-[10px] mb-1">Outlet Website</span>
                  <SafeLink url={selected.outlet_website} />
                </div>
              </div>

              <div>
                <span className="block text-nbac-muted uppercase tracking-wider text-[10px] mb-2">Coverage Plan</span>
                <p className="rounded-xl border border-nbac-border/60 bg-[#12181a] p-4 text-xs text-nbac-body leading-relaxed whitespace-pre-wrap select-text">
                  {selected.coverage_plan || 'Not provided'}
                </p>
              </div>

              <div>
                <span className="block text-nbac-muted uppercase tracking-wider text-[10px] mb-2">Additional Crew</span>
                <p className="rounded-xl border border-nbac-border/60 bg-[#12181a] p-4 text-xs text-nbac-body leading-relaxed whitespace-pre-wrap select-text">
                  {selected.additional_crew || 'None'}
                </p>
              </div>
            </div>
          </div>
        )}
      </AccessibleModal>
    </div>
  );
}
