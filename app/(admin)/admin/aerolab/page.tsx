'use client';

import React, { useState, useEffect } from 'react';
import { FileDown, Search, ArrowUpRight, Filter, ExternalLink } from 'lucide-react';
import { useAdminRole } from '@/hooks/use-admin-role';
import { RoleBanner } from '@/components/admin/role-banner';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/shared/toast';
import { TRACKS } from '@/lib/aerolab-tracks';
import { isValidHttpUrl } from '@/lib/utils';
import { AccessibleModal } from '@/components/shared/accessible-modal';

interface AeroLabApplication {
  id: string;
  reference: string;
  team_name: string;
  leader_name: string;
  leader_email: string;
  leader_phone?: string;
  organization?: string;
  track_id: number;
  track_title: string;
  member_count: number;
  member_roster?: string;
  proposal_title: string;
  concept_note: string;
  repo_portfolio_url?: string;
  status: 'pending' | 'shortlisted' | 'accepted' | 'rejected';
  created_at: string;
}

const getCsvFilename = () => `nbac_aerolab_applications_${Date.now()}.csv`;

function parseSpecialRequirements(reqs?: string | null) {
  if (!reqs) {
    return {
      proposal_title: 'AeroLab Proposal',
      concept_note: 'No concept note provided',
      repo_portfolio_url: undefined,
      member_roster: undefined,
    };
  }

  let proposal_title = 'AeroLab Proposal';
  let concept_note = reqs;
  let repo_portfolio_url: string | undefined = undefined;
  let member_roster: string | undefined = undefined;

  const repoMatch = reqs.match(/REPO\/DEMO:\s*(https?:\/\/[^\s\n]+)/i);
  if (repoMatch) {
    repo_portfolio_url = repoMatch[1].trim();
  }

  const proposalMatch = reqs.match(/PROPOSAL:\s*([^\n\r]+)/i);
  if (proposalMatch) {
    proposal_title = proposalMatch[1].trim();
  }

  const rosterMatch = reqs.match(/ROSTER:\s*([^\n\r]+)/i);
  if (rosterMatch) {
    member_roster = rosterMatch[1].trim();
  }

  const conceptMatch = reqs.match(/CONCEPT:\s*([\s\S]+?)(?=\n[A-Z]+:|$)/i);
  if (conceptMatch) {
    concept_note = conceptMatch[1].trim();
  }

  return {
    proposal_title,
    concept_note,
    repo_portfolio_url,
    member_roster,
  };
}

export default function AdminAeroLabPage() {
  useAdminRole();
  const toast = useToast();
  const [applications, setApplications] = useState<AeroLabApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<AeroLabApplication | null>(null);

  useEffect(() => {
    let active = true;
    async function fetchApplications() {
      try {
        const supabase = createClient();

        // 1. Try fetching from 'aerolab_applications' table
        const { data: aeroData, error: aeroError } = await supabase
          .from('aerolab_applications')
          .select('*')
          .order('created_at', { ascending: false });

        if (!aeroError && aeroData && active) {
          const safeData: AeroLabApplication[] = (aeroData as Record<string, unknown>[]).map((app) => ({
            id: String(app.id || ''),
            reference: String(app.reference || ''),
            team_name: String(app.team_name || 'Team Entry'),
            leader_name: String(app.leader_name || 'Unknown'),
            leader_email: String(app.leader_email || ''),
            leader_phone: app.leader_phone ? String(app.leader_phone) : undefined,
            organization: app.organization ? String(app.organization) : undefined,
            track_id: Number(app.track_id || 1),
            track_title: String(app.track_title || 'Track Challenge'),
            member_count: Number(app.member_count || 3),
            member_roster: app.member_roster ? String(app.member_roster) : undefined,
            proposal_title: String(app.proposal_title || 'AeroLab Proposal'),
            concept_note: String(app.concept_note || ''),
            repo_portfolio_url: app.repo_portfolio_url ? String(app.repo_portfolio_url) : undefined,
            status: (app.status as AeroLabApplication['status']) || 'pending',
            created_at: String(app.created_at || new Date().toISOString()),
          }));
          setApplications(safeData);
          setLoading(false);
          return;
        }

        // 2. Fallback to 'reservations' table where reference starts with AEROLAB or tier contains AeroLab
        const { data: resData, error: resError } = await supabase
          .from('reservations')
          .select('*')
          .or('reference.ilike.AEROLAB%,tier.ilike.%AeroLab%')
          .order('created_at', { ascending: false });

        if (!resError && resData && active) {
          const mapped: AeroLabApplication[] = (resData as Record<string, unknown>[]).map((row) => {
            const reqs = row.special_requirements ? String(row.special_requirements) : null;
            const parsed = parseSpecialRequirements(reqs);
            const tierStr = row.tier ? String(row.tier) : '';
            const matchedTrackId = parseInt(tierStr.match(/Track (\d+)/)?.[1] || '1', 10);
            const matchedTrackObj = TRACKS.find(t => t.id === matchedTrackId);

            return {
              id: String(row.id || ''),
              reference: String(row.reference || `AEROLAB-${String(row.id || '').slice(0, 8)}`),
              team_name: String(row.company || row.name || 'Team Entry'),
              leader_name: String(row.name || 'Unknown'),
              leader_email: String(row.email || ''),
              leader_phone: row.phone ? String(row.phone) : undefined,
              organization: row.company ? String(row.company) : undefined,
              track_id: matchedTrackId,
              track_title: matchedTrackObj ? matchedTrackObj.title : (tierStr || 'Track Challenge'),
              member_count: Number(row.delegate_count || 3),
              member_roster: parsed.member_roster,
              proposal_title: parsed.proposal_title,
              concept_note: parsed.concept_note,
              repo_portfolio_url: parsed.repo_portfolio_url,
              status: row.status === 'paid' ? 'shortlisted' : 'pending',
              created_at: String(row.created_at || new Date().toISOString()),
            };
          });
          setApplications(mapped);
        }
      } catch (err) {
        console.error('Failed to load AeroLab applications:', err);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchApplications();

    return () => {
      active = false;
    };
  }, []);

  // Filter logic
  const filteredApps = applications.filter((app) => {
    const leaderName = (app.leader_name || '').toLowerCase();
    const leaderEmail = (app.leader_email || '').toLowerCase();
    const teamName = (app.team_name || '').toLowerCase();
    const ref = (app.reference || '').toLowerCase();
    const title = (app.proposal_title || '').toLowerCase();
    const searchLower = search.toLowerCase();

    const matchesSearch =
      teamName.includes(searchLower) ||
      leaderName.includes(searchLower) ||
      leaderEmail.includes(searchLower) ||
      ref.includes(searchLower) ||
      title.includes(searchLower);

    const matchesTrack = selectedTrack === 'all' || app.track_id.toString() === selectedTrack;

    return matchesSearch && matchesTrack;
  });

  const exportCsv = () => {
    if (filteredApps.length === 0) {
      toast.error('No applications available to export.');
      return;
    }

    const headers = [
      'Reference',
      'Team Name',
      'Leader Name',
      'Leader Email',
      'Phone',
      'Organization',
      'Track ID',
      'Track Title',
      'Member Count',
      'Proposal Title',
      'Status',
      'Submitted Date',
      'Repo / Demo Link',
      'Concept Note'
    ];

    const csvCell = (value: unknown) => {
      const text = value === null || value === undefined ? '' : String(value);
      const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
      return `"${safe.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
    };

    const rows = filteredApps.map(app => [
      csvCell(app.reference),
      csvCell(app.team_name),
      csvCell(app.leader_name),
      csvCell(app.leader_email),
      csvCell(app.leader_phone),
      csvCell(app.organization),
      app.track_id,
      csvCell(app.track_title),
      app.member_count,
      csvCell(app.proposal_title),
      csvCell(app.status),
      csvCell(new Date(app.created_at).toISOString()),
      csvCell(app.repo_portfolio_url),
      csvCell(app.concept_note)
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = getCsvFilename();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${filteredApps.length} AeroLab applications to CSV.`);
  };

  return (
    <div className="space-y-6">
      <RoleBanner />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="font-sans text-xs uppercase tracking-widest font-semibold text-nbac-emerald-light">
            Hackathon Management
          </span>
          <h2 className="font-display text-2xl font-bold text-nbac-text mt-1">
            AeroLab Submissions & Intake
          </h2>
          <p className="font-sans text-xs text-nbac-muted mt-1">
            View, filter, and export AeroLab team proposals and technical concept notes.
          </p>
        </div>

        <button
          onClick={exportCsv}
          disabled={filteredApps.length === 0}
          className="bg-nbac-gold hover:bg-nbac-gold-light text-[#0b0f10] disabled:opacity-40 font-sans font-bold px-5 py-2.5 rounded-lg transition-all flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
        >
          <FileDown size={16} />
          <span>Export CSV ({filteredApps.length})</span>
        </button>
      </div>

      {/* Controls Bar: Search & Track Filter */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-nbac-panel border border-nbac-border rounded-lg p-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-nbac-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Team, Leader, Email, Reference, or Proposal..."
            className="w-full bg-[#0b0f10] border border-nbac-border focus:border-nbac-gold rounded-lg pl-10 pr-4 py-2.5 text-xs text-nbac-text focus:outline-none transition-colors"
          />
        </div>

        {/* Track Selector */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <Filter className="w-4 h-4 text-nbac-muted" />
          <select
            value={selectedTrack}
            onChange={(e) => setSelectedTrack(e.target.value)}
            className="bg-[#0b0f10] border border-nbac-border text-nbac-text text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-nbac-gold cursor-pointer"
          >
            <option value="all">All Tracks (1–5)</option>
            {TRACKS.map((t) => (
              <option key={t.id} value={t.id.toString()}>
                Track 0{t.id} — {t.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-nbac-panel border border-nbac-border rounded-lg overflow-hidden select-none">
        {loading ? (
          <div className="p-12 text-center text-nbac-muted font-sans text-xs">
            Loading AeroLab applications…
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="p-12 text-center text-nbac-muted font-sans text-xs">
            No AeroLab applications found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-nbac-border bg-[#0b0f10]/40 text-nbac-muted uppercase tracking-wider font-semibold text-[11px]">
                  <th className="p-4 pl-6">Reference</th>
                  <th className="p-4">Team & Leader</th>
                  <th className="p-4">Track</th>
                  <th className="p-4">Proposal</th>
                  <th className="p-4">Members</th>
                  <th className="p-4">Submitted</th>
                  <th className="p-4 pr-6 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nbac-border/40 text-nbac-body">
                {filteredApps.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className="hover:bg-nbac-panel/60 transition-colors cursor-pointer group"
                  >
                    <td className="p-4 pl-6 font-mono font-semibold text-nbac-gold">
                      {app.reference}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-nbac-text">{app.team_name}</div>
                      <div className="text-nbac-muted text-[11px]">
                        {app.leader_name} • {app.leader_email}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-block px-2 py-0.5 rounded bg-nbac-emerald/10 border border-nbac-emerald/20 text-nbac-emerald-light font-semibold text-[10px] uppercase tracking-wider">
                        Track 0{app.track_id}
                      </span>
                    </td>
                    <td className="p-4 max-w-xs truncate font-medium text-nbac-text">
                      {app.proposal_title}
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-semibold text-nbac-text">{app.member_count}</span>
                    </td>
                    <td className="p-4 text-nbac-muted">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApp(app);
                        }}
                        className="p-1.5 rounded text-nbac-muted hover:text-nbac-gold hover:bg-nbac-panel transition-colors"
                        title="View Full Application"
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

      {/* Modal Drawer for Viewing Application Details */}
      <AccessibleModal
        isOpen={selectedApp !== null}
        onClose={() => setSelectedApp(null)}
        titleId="selected-app-title"
        ariaLabel="Application Details"
      >
        {selectedApp && (
          <div>
            {/* Header */}
            <div className="flex items-start justify-between border-b border-nbac-border/60 pb-5 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-nbac-gold bg-nbac-gold/10 px-2.5 py-0.5 rounded border border-nbac-gold/20">
                    {selectedApp.reference}
                  </span>
                  <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-nbac-emerald bg-nbac-emerald/10 border border-nbac-emerald/20 px-2.5 py-0.5 rounded-full">
                    Track 0{selectedApp.track_id}
                  </span>
                </div>
                <h3 id="selected-app-title" className="font-sans text-2xl font-bold text-nbac-text leading-tight">
                  {selectedApp.team_name}
                </h3>
                <p className="text-xs text-nbac-muted font-medium mt-1">
                  Leader: {selectedApp.leader_name} ({selectedApp.leader_email})
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="space-y-6">
              {/* Meta details grid */}
              <div className="grid grid-cols-2 gap-4 bg-[#12181a] border border-nbac-border/60 rounded-xl p-4 text-xs">
                <div>
                  <span className="text-nbac-muted uppercase tracking-wider text-[10px] font-semibold block mb-0.5">Organization</span>
                  <span className="font-medium text-nbac-text">{selectedApp.organization || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-nbac-muted uppercase tracking-wider text-[10px] font-semibold block mb-0.5">Phone</span>
                  <span className="font-medium text-nbac-text">{selectedApp.leader_phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-nbac-muted uppercase tracking-wider text-[10px] font-semibold block mb-0.5">Team Size</span>
                  <span className="font-medium text-nbac-text">{selectedApp.member_count} Members</span>
                </div>
                <div>
                  <span className="text-nbac-muted uppercase tracking-wider text-[10px] font-semibold block mb-0.5">Submitted Date</span>
                  <span className="font-medium text-nbac-text">{new Date(selectedApp.created_at).toLocaleString()}</span>
                </div>
              </div>

              {/* Proposal Title */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-nbac-gold mb-1">Proposal Title</h4>
                <p className="text-base font-bold text-nbac-text">{selectedApp.proposal_title}</p>
              </div>

              {/* Concept Note */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-nbac-emerald mb-2">Concept Note & Architecture</h4>
                <div className="bg-[#12181a] border border-nbac-border/60 rounded-xl p-4 text-xs font-light text-nbac-body leading-relaxed whitespace-pre-wrap">
                  {selectedApp.concept_note}
                </div>
              </div>

              {/* Team Roster */}
              {selectedApp.member_roster && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-nbac-gold mb-2">Team Roster</h4>
                  <div className="bg-[#12181a] border border-nbac-border/60 rounded-xl p-4 text-xs font-light text-nbac-body leading-relaxed whitespace-pre-wrap">
                    {selectedApp.member_roster}
                  </div>
                </div>
              )}

              {/* Repo / Portfolio Link with scheme validation */}
              {isValidHttpUrl(selectedApp.repo_portfolio_url) ? (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-nbac-emerald mb-1">Code Repo / Figma / Demo</h4>
                  <a
                    href={selectedApp.repo_portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-nbac-emerald hover:underline font-mono inline-flex items-center gap-1"
                  >
                    <span>{selectedApp.repo_portfolio_url}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : selectedApp.repo_portfolio_url ? (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-nbac-emerald mb-1">Code Repo / Figma / Demo</h4>
                  <span className="text-xs text-nbac-muted font-mono">{selectedApp.repo_portfolio_url}</span>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </AccessibleModal>
    </div>
  );
}
