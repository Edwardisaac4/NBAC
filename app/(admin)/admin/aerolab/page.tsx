'use client';

import React, { useState, useEffect } from 'react';
import { FileDown, Search, ArrowUpRight, CheckCircle2, AlertCircle, XCircle, X, Award, Users, Filter, Calendar, ExternalLink } from 'lucide-react';
import { useAdminRole } from '@/hooks/use-admin-role';
import { RoleBanner } from '@/components/admin/role-banner';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/shared/toast';

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

        if (!aeroError && aeroData && aeroData.length > 0 && active) {
          setApplications(aeroData as AeroLabApplication[]);
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
          const mapped: AeroLabApplication[] = resData.map((row: any) => ({
            id: row.id,
            reference: row.reference || `AEROLAB-${row.id.slice(0, 8)}`,
            team_name: row.company || row.name || 'Team Entry',
            leader_name: row.name,
            leader_email: row.email,
            leader_phone: row.phone,
            organization: row.company,
            track_id: parseInt(row.tier?.match(/Track (\d+)/)?.[1] || '1', 10),
            track_title: row.tier || 'Track Challenge',
            member_count: row.delegate_count || 3,
            member_roster: row.special_requirements,
            proposal_title: row.special_requirements?.split('\n')?.[0]?.replace('PROPOSAL: ', '') || 'AeroLab Proposal',
            concept_note: row.special_requirements || 'No concept note provided',
            status: row.status === 'paid' ? 'shortlisted' : 'pending',
            created_at: row.created_at
          }));
          setApplications(mapped);
        }
      } catch (err) {
        console.error('Failed to load AeroLab applications:', err);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchApplications();
  }, []);

  // Filter logic
  const filteredApps = applications.filter((app) => {
    const matchesSearch = 
      app.team_name.toLowerCase().includes(search.toLowerCase()) ||
      app.leader_name.toLowerCase().includes(search.toLowerCase()) ||
      app.leader_email.toLowerCase().includes(search.toLowerCase()) ||
      app.reference.toLowerCase().includes(search.toLowerCase()) ||
      app.proposal_title.toLowerCase().includes(search.toLowerCase());

    const matchesTrack = selectedTrack === 'all' || app.track_id.toString() === selectedTrack;

    return matchesSearch && matchesTrack;
  });

  // Export CSV Function
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

    const rows = filteredApps.map(app => [
      `"${app.reference}"`,
      `"${app.team_name.replace(/"/g, '""')}"`,
      `"${app.leader_name.replace(/"/g, '""')}"`,
      `"${app.leader_email.replace(/"/g, '""')}"`,
      `"${(app.leader_phone || '').replace(/"/g, '""')}"`,
      `"${(app.organization || '').replace(/"/g, '""')}"`,
      app.track_id,
      `"${app.track_title.replace(/"/g, '""')}"`,
      app.member_count,
      `"${app.proposal_title.replace(/"/g, '""')}"`,
      app.status,
      `"${new Date(app.created_at).toLocaleDateString()}"`,
      `"${(app.repo_portfolio_url || '').replace(/"/g, '""')}"`,
      `"${(app.concept_note || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', getCsvFilename());
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${filteredApps.length} AeroLab applications to CSV.`);
  };

  return (
    <div className="space-y-6">
      <RoleBanner />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-nbac-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-nbac-gold/10 text-nbac-gold border border-nbac-gold/20">
              <Award className="w-4 h-4" />
            </span>
            <span className="font-sans text-xs font-bold uppercase tracking-wider text-nbac-gold">
              Hackathon Intake Vault
            </span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-nbac-text">
            AeroLab Applications
          </h1>
          <p className="font-sans text-xs text-nbac-muted font-light mt-1">
            Manage, evaluate, and export submitted hackathon team entries across all 5 challenge tracks.
          </p>
        </div>

        <button
          onClick={exportCsv}
          className="bg-nbac-emerald hover:bg-nbac-emerald-dark text-white font-sans font-bold text-xs px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 uppercase tracking-wider shrink-0 cursor-pointer shadow-md"
        >
          <FileDown className="w-4 h-4" />
          <span>Export CSV / Excel</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-nbac-panel/40 border border-nbac-border p-4 rounded-xl">
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
            <option value="1">Track 01 — Regulatory Clearance</option>
            <option value="2">Track 02 — Finance & Leasing</option>
            <option value="3">Track 03 — SAF & Carbon</option>
            <option value="4">Track 04 — AI & Flight Ops</option>
            <option value="5">Track 05 — Workforce & Training</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-nbac-panel/30 border border-nbac-border rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-nbac-muted font-sans text-xs">
            <div className="w-8 h-8 rounded-full border-2 border-nbac-emerald border-t-transparent animate-spin mx-auto mb-3" />
            <span>Loading AeroLab Applications...</span>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="p-12 text-center text-nbac-muted font-sans text-xs space-y-2">
            <AlertCircle className="w-8 h-8 text-nbac-gold mx-auto" />
            <p className="font-semibold text-nbac-text">No AeroLab Applications Found</p>
            <p className="text-nbac-muted">Try clearing search filters or submitting a test entry at /aerolab/apply.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs border-collapse">
              <thead>
                <tr className="bg-[#0b0f10] border-b border-nbac-border text-nbac-muted uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3.5 px-4">Reference</th>
                  <th className="py-3.5 px-4">Team & Leader</th>
                  <th className="py-3.5 px-4">Track</th>
                  <th className="py-3.5 px-4">Members</th>
                  <th className="py-3.5 px-4">Proposal Title</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nbac-border/40 text-nbac-body">
                {filteredApps.map((app) => (
                  <tr 
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className="hover:bg-nbac-panel/60 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono text-[11px] font-bold text-nbac-gold">
                      {app.reference}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-nbac-text group-hover:text-nbac-gold-light transition-colors">
                        {app.team_name}
                      </div>
                      <div className="text-[11px] text-nbac-muted">
                        {app.leader_name} ({app.leader_email})
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-nbac-emerald bg-nbac-emerald/10 border border-nbac-emerald/20 px-2.5 py-0.5 rounded-full inline-block">
                        Track 0{app.track_id}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-nbac-text">
                      {app.member_count} Members
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate font-medium text-nbac-text">
                      {app.proposal_title}
                    </td>
                    <td className="py-3.5 px-4 text-nbac-muted text-[11px]">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
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
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedApp(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-2xl bg-[#0b0f10] border border-nbac-gold/30 rounded-2xl shadow-2xl p-6 md:p-8 overflow-hidden font-sans text-left max-h-[85vh] overflow-y-auto"
            >
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
                  <h3 className="font-sans text-2xl font-bold text-nbac-text leading-tight">
                    {selectedApp.team_name}
                  </h3>
                  <p className="text-xs text-nbac-muted font-medium mt-1">
                    Leader: {selectedApp.leader_name} ({selectedApp.leader_email})
                  </p>
                </div>

                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-2 text-nbac-muted hover:text-nbac-text hover:bg-nbac-panel rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
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

                {/* Repo / Portfolio Link */}
                {selectedApp.repo_portfolio_url && (
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
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
