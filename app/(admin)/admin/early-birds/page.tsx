'use client';

import React, { useState, useEffect } from 'react';
import {
  FileDown,
  Search,
  Filter,
  ArrowUpRight,
  Users,
  Sparkles,
  Wallet,
  CalendarClock,
  ChevronDown,
} from 'lucide-react';
import { useAdminRole } from '@/hooks/use-admin-role';
import { RoleBanner } from '@/components/admin/role-banner';
import { KpiCard } from '@/components/admin/kpi-card';
import { AccessibleModal } from '@/components/shared/accessible-modal';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/shared/toast';

interface EarlyBirdLead {
  id: string;
  full_name: string;
  job_title: string | null;
  company: string | null;
  country: string | null;
  email: string;
  phone: string;
  role: string;
  attendee_count: number;
  areas_of_interest: string[];
  ticket_preference: string;
  source: string | null;
  payment_choice: string;
  discount_code: string | null;
  consent: boolean;
  signature_data: string | null;
  verification_date: string | null;
  created_at: string;
}

const getCsvFilename = () => `nbac_early_bird_leads_${new Date().toISOString().slice(0, 10)}.csv`;

const titleCase = (value: string) =>
  value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// A native select popup is sized by its longest option, and its width cannot be
// styled. Keep option labels to a single short line so one unexpected value can
// never stretch the dropdown past the edge of the screen.
const optionLabel = (value: string, max = 28) => {
  const firstLine = titleCase(value.split('\n')[0].trim());
  return firstLine.length > max ? `${firstLine.slice(0, max - 1)}…` : firstLine;
};

export default function EarlyBirdsPage() {
  useAdminRole();
  const toast = useToast();

  const [leads, setLeads] = useState<EarlyBirdLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<EarlyBirdLead | null>(null);
  const [recentCount, setRecentCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function fetchLeads() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('interests')
          .select('*')
          .order('created_at', { ascending: false });

        if (!active) return;

        if (error) {
          console.error('Failed to fetch early bird leads:', error.message);
          setFetchError('Could not load early bird submissions. Please refresh or check your access level.');
          return;
        }

        const rows = (data || []) as EarlyBirdLead[];

        // Computed here rather than during render: Date.now() is impure.
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        setRecentCount(
          rows.filter((row) => new Date(row.created_at).getTime() >= sevenDaysAgo).length
        );

        setLeads(
          rows.map((row) => ({
            ...row,
            areas_of_interest: Array.isArray(row.areas_of_interest) ? row.areas_of_interest : [],
            attendee_count: Number(row.attendee_count) || 1,
          }))
        );
      } catch (err) {
        console.error('Failed to load early bird leads:', err);
        if (active) setFetchError('An unexpected error occurred while loading submissions.');
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchLeads();
    return () => {
      active = false;
    };
  }, []);

  const filteredLeads = leads.filter((lead) => {
    const term = search.trim().toLowerCase();
    const matchesSearch =
      term === '' ||
      lead.full_name.toLowerCase().includes(term) ||
      lead.email.toLowerCase().includes(term) ||
      (lead.company || '').toLowerCase().includes(term) ||
      (lead.phone || '').toLowerCase().includes(term) ||
      (lead.discount_code || '').toLowerCase().includes(term);

    const matchesPayment = selectedPayment === 'all' || lead.payment_choice === selectedPayment;
    const matchesRole =
      selectedRole === 'all' ||
      (lead.role || '').split('\n')[0].trim() === selectedRole;

    return matchesSearch && matchesPayment && matchesRole;
  });

  // KPI aggregation across every lead, not just the filtered view
  const payNowCount = leads.filter((l) => l.payment_choice === 'pay_now').length;
  const totalAttendees = leads.reduce((sum, l) => sum + (Number(l.attendee_count) || 0), 0);

  const roleOptions = Array.from(
    new Set(leads.map((l) => (l.role || '').split('\n')[0].trim()).filter(Boolean))
  ).sort();

  const exportCsv = () => {
    if (filteredLeads.length === 0) {
      toast.error('No submissions available to export.');
      return;
    }

    const headers = [
      'Submitted At',
      'Full Name',
      'Job Title',
      'Company',
      'Country',
      'Email',
      'Phone',
      'Role',
      'Attendees',
      'Ticket Preference',
      'Payment Choice',
      'Discount Code',
      'Areas of Interest',
      'Source',
      'Consent',
      'Signature Captured',
      'Verification Date',
    ];

    // Guard against CSV formula injection in spreadsheet apps
    const csvCell = (value: unknown) => {
      const text = value === null || value === undefined ? '' : String(value);
      const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
      return `"${safe.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
    };

    const rows = filteredLeads.map((lead) => [
      csvCell(new Date(lead.created_at).toISOString()),
      csvCell(lead.full_name),
      csvCell(lead.job_title),
      csvCell(lead.company),
      csvCell(lead.country),
      csvCell(lead.email),
      csvCell(lead.phone),
      csvCell(lead.role),
      lead.attendee_count,
      csvCell(lead.ticket_preference),
      csvCell(lead.payment_choice),
      csvCell(lead.discount_code),
      csvCell(lead.areas_of_interest.join('; ')),
      csvCell(lead.source),
      csvCell(lead.consent ? 'Yes' : 'No'),
      csvCell(lead.signature_data ? 'Yes' : 'No'),
      csvCell(lead.verification_date),
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

    toast.success(`Exported ${filteredLeads.length} early bird submissions to CSV.`);
  };

  const paymentBadge = (choice: string) =>
    choice === 'pay_now' ? (
      <span className="inline-block px-2 py-0.5 rounded bg-nbac-gold/10 border border-nbac-gold/25 text-nbac-gold-light font-semibold text-[10px] uppercase tracking-wider">
        Pay Now · 10%
      </span>
    ) : (
      <span className="inline-block px-2 py-0.5 rounded bg-nbac-emerald/10 border border-nbac-emerald/20 text-nbac-emerald-light font-semibold text-[10px] uppercase tracking-wider">
        Pay Later · 5%
      </span>
    );

  return (
    <div className="space-y-6">
      <RoleBanner />

      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-sans text-xs uppercase tracking-widest font-semibold text-nbac-emerald-light">
            Lead Capture
          </span>
          <h2 className="font-display text-2xl font-bold text-nbac-text mt-1">
            Early Bird Submissions
          </h2>
          <p className="font-sans text-xs text-nbac-muted mt-1">
            Every early bird interest form captured on site or online. Filter, review and export to CSV.
          </p>
        </div>

        <button
          onClick={exportCsv}
          disabled={filteredLeads.length === 0}
          className="bg-nbac-gold hover:bg-nbac-gold-light text-[#0b0f10] disabled:opacity-40 font-sans font-bold px-5 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
        >
          <FileDown size={16} />
          <span>Export CSV ({filteredLeads.length})</span>
        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Total Leads" value={leads.length} icon={Sparkles} highlight />
        <KpiCard title="Pay Now (10%)" value={payNowCount} icon={Wallet} />
        <KpiCard title="Expected Attendees" value={totalAttendees} icon={Users} />
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
            placeholder="Search name, email, company or code..."
            className="w-full bg-[#0b0f10] border border-nbac-border focus:border-nbac-gold rounded-lg pl-10 pr-4 py-2.5 text-base sm:text-xs text-nbac-text focus:outline-none transition-colors"
          />
        </div>

        <div className="grid w-full shrink-0 grid-cols-1 gap-2 sm:grid-cols-2 md:flex md:w-auto md:items-center">
          <Filter className="hidden w-4 h-4 shrink-0 text-nbac-muted md:block" />

          <div className="relative min-w-0">
            <select
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value)}
              aria-label="Filter by payment choice"
              className="w-full appearance-none truncate bg-[#0b0f10] border border-nbac-border text-nbac-text text-base sm:text-xs rounded-lg pl-3 pr-9 py-2.5 focus:outline-none focus:border-nbac-gold cursor-pointer"
            >
              <option value="all">All Payment Choices</option>
              <option value="pay_now">Pay Now (10%)</option>
              <option value="pay_later">Pay Later (5%)</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-nbac-muted pointer-events-none" />
          </div>

          <div className="relative min-w-0">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              aria-label="Filter by role"
              className="w-full appearance-none truncate bg-[#0b0f10] border border-nbac-border text-nbac-text text-base sm:text-xs rounded-lg pl-3 pr-9 py-2.5 focus:outline-none focus:border-nbac-gold cursor-pointer"
            >
              <option value="all">All Roles</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {optionLabel(role)}
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
            Loading early bird submissions…
          </div>
        ) : fetchError ? (
          <div className="p-12 text-center text-red-400 font-sans text-xs">{fetchError}</div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-12 text-center text-nbac-muted font-sans text-xs">
            {leads.length === 0
              ? 'No early bird submissions have been captured yet.'
              : 'No submissions match your filters.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-nbac-border bg-[#0b0f10]/40 text-nbac-muted uppercase tracking-wider font-semibold text-[11px]">
                  <th className="p-4 pl-6">Delegate</th>
                  <th className="p-4">Company</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Code</th>
                  <th className="p-4 text-center">Pax</th>
                  <th className="p-4">Submitted</th>
                  <th className="p-4 pr-6 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nbac-border/40 text-nbac-body">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="hover:bg-nbac-panel/60 transition-colors cursor-pointer"
                  >
                    <td className="p-4 pl-6">
                      <div className="font-bold text-nbac-text">{lead.full_name}</div>
                      <div className="text-nbac-muted text-[11px]">{lead.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-nbac-text">{lead.company || '—'}</div>
                      <div className="text-nbac-muted text-[11px]">{lead.country || '—'}</div>
                    </td>
                    <td className="p-4 capitalize">{titleCase(lead.role)}</td>
                    <td className="p-4">{paymentBadge(lead.payment_choice)}</td>
                    <td className="p-4 font-mono font-semibold text-nbac-gold">
                      {lead.discount_code || '—'}
                    </td>
                    <td className="p-4 text-center font-semibold text-nbac-text">
                      {lead.attendee_count}
                    </td>
                    <td className="p-4 text-nbac-muted">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLead(lead);
                        }}
                        className="p-1.5 rounded text-nbac-muted hover:text-nbac-gold hover:bg-nbac-panel transition-colors"
                        title="View Full Submission"
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
        isOpen={selectedLead !== null}
        onClose={() => setSelectedLead(null)}
        titleId="selected-lead-title"
        ariaLabel="Early Bird Submission Details"
      >
        {selectedLead && (
          <div>
            {/* Header */}
            <div className="flex items-start justify-between border-b border-nbac-border/60 pb-5 mb-5">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {paymentBadge(selectedLead.payment_choice)}
                  {selectedLead.discount_code && (
                    <span className="font-mono text-xs font-bold text-nbac-gold bg-nbac-gold/10 px-2.5 py-0.5 rounded border border-nbac-gold/20">
                      {selectedLead.discount_code}
                    </span>
                  )}
                </div>
                <h3
                  id="selected-lead-title"
                  className="font-sans text-2xl font-bold text-nbac-text leading-tight"
                >
                  {selectedLead.full_name}
                </h3>
                <p className="text-xs text-nbac-muted font-medium mt-1">
                  {selectedLead.job_title || 'Role not stated'}
                  {selectedLead.company ? ` · ${selectedLead.company}` : ''}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Meta grid */}
              <div className="grid grid-cols-1 gap-4 bg-[#12181a] border border-nbac-border/60 rounded-xl p-4 text-xs sm:grid-cols-2">
                <div>
                  <span className="block text-nbac-muted uppercase tracking-wider text-[10px] mb-1">Email</span>
                  <a href={`mailto:${selectedLead.email}`} className="text-nbac-text hover:text-nbac-gold break-all">
                    {selectedLead.email}
                  </a>
                </div>
                <div>
                  <span className="block text-nbac-muted uppercase tracking-wider text-[10px] mb-1">Phone / WhatsApp</span>
                  <a href={`tel:${selectedLead.phone}`} className="text-nbac-text hover:text-nbac-gold">
                    {selectedLead.phone}
                  </a>
                </div>
                <div>
                  <span className="block text-nbac-muted uppercase tracking-wider text-[10px] mb-1">Country</span>
                  <span className="text-nbac-text">{selectedLead.country || '—'}</span>
                </div>
                <div>
                  <span className="block text-nbac-muted uppercase tracking-wider text-[10px] mb-1">Role</span>
                  <span className="text-nbac-text">{titleCase(selectedLead.role)}</span>
                </div>
                <div>
                  <span className="block text-nbac-muted uppercase tracking-wider text-[10px] mb-1">Ticket Preference</span>
                  <span className="text-nbac-text">{titleCase(selectedLead.ticket_preference)}</span>
                </div>
                <div>
                  <span className="block text-nbac-muted uppercase tracking-wider text-[10px] mb-1">Attendees</span>
                  <span className="text-nbac-text">{selectedLead.attendee_count}</span>
                </div>
                <div>
                  <span className="block text-nbac-muted uppercase tracking-wider text-[10px] mb-1">Source</span>
                  <span className="text-nbac-text">{selectedLead.source || '—'}</span>
                </div>
                <div>
                  <span className="block text-nbac-muted uppercase tracking-wider text-[10px] mb-1">Submitted</span>
                  <span className="text-nbac-text">
                    {new Date(selectedLead.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Areas of interest */}
              <div>
                <span className="block text-nbac-muted uppercase tracking-wider text-[10px] mb-2">
                  Areas of Interest
                </span>
                {selectedLead.areas_of_interest.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedLead.areas_of_interest.map((area) => (
                      <span
                        key={area}
                        className="inline-flex items-center rounded-full border border-nbac-border bg-[#0b0f10] px-3 py-1 text-[11px] text-nbac-body"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-nbac-muted">None selected</span>
                )}
              </div>

              {/* Consent & signature */}
              <div>
                <span className="block text-nbac-muted uppercase tracking-wider text-[10px] mb-2">
                  Consent & Signature
                </span>
                <div className="rounded-xl border border-nbac-border/60 bg-[#12181a] p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-nbac-muted">Communications consent</span>
                    <span className={selectedLead.consent ? 'text-nbac-emerald font-semibold' : 'text-red-400 font-semibold'}>
                      {selectedLead.consent ? 'Granted' : 'Not granted'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-nbac-muted">Verification date</span>
                    <span className="text-nbac-text font-mono">{selectedLead.verification_date || '—'}</span>
                  </div>

                  {selectedLead.signature_data ? (
                    <div className="rounded-lg bg-white p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedLead.signature_data}
                        alt={`Signature captured for ${selectedLead.full_name}`}
                        className="mx-auto h-28 w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-nbac-border/70 p-4 text-center text-nbac-muted">
                      No signature captured
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </AccessibleModal>
    </div>
  );
}
