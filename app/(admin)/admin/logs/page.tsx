'use client';

import React, { useState, useEffect } from 'react';
import { ShieldX, Terminal, Calendar } from 'lucide-react';
import { useAdminRole } from '@/hooks/use-admin-role';
import { RoleBanner } from '@/components/admin/role-banner';
import { createClient } from '@/lib/supabase/client';

interface DBLog {
  id: string;
  admin: string;
  role: string;
  action: 'login' | 'published' | 'edited' | 'deleted' | 'permission_changed';
  target: string;
  ip: string;
  date: string;
}

export default function SecurityLogsPage() {
  const { isHeadAdmin } = useAdminRole();
  const [logs, setLogs] = useState<DBLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<string>('all');

  useEffect(() => {
    if (!isHeadAdmin) return;
    
    let active = true;
    async function fetchLogs() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Failed to fetch audit logs from Supabase:', error.message);
          return;
        }

        if (active && data) {
          const mapped: DBLog[] = (data as {
            id: string;
            admin_email: string;
            role: string;
            action: DBLog['action'];
            target: string;
            ip_address: string | null;
            created_at: string;
          }[]).map((row) => {
            const dateObj = new Date(row.created_at);
            const formattedDate = dateObj.toLocaleString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }).replace(',', '');

            return {
              id: row.id,
              admin: row.admin_email,
              role: row.role,
              action: row.action,
              target: row.target,
              ip: row.ip_address || '127.0.0.1',
              date: formattedDate
            };
          });
          setLogs(mapped);
        }
      } catch (err) {
        console.error('Failed to load logs:', err);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchLogs();
    return () => {
      active = false;
    };
  }, [isHeadAdmin]);

  // Hard route protection in component layout (preventing editor page manual entries)
  if (!isHeadAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 select-none">
        <div className="w-16 h-16 rounded-full bg-nbac-danger/10 border border-nbac-danger/25 flex items-center justify-center text-nbac-danger mb-4 animate-bounce">
          <ShieldX size={32} />
        </div>
        <h3 className="font-display text-2xl font-bold text-nbac-text text-center">
          Access Denied — 403
        </h3>
        <p className="font-sans text-sm text-nbac-muted text-center max-w-sm mt-2 font-light leading-relaxed">
          The Security Logs module is restricted to Head Administrators. Your account does not possess the credentials to view these logs.
        </p>
      </div>
    );
  }

  const filteredLogs = logs.filter(log => filterAction === 'all' || log.action === filterAction);

  const getActionBadgeColor = (action: DBLog['action']) => {
    switch (action) {
      case 'login':
        return 'text-nbac-emerald-light border-nbac-emerald/10 bg-nbac-emerald/5';
      case 'permission_changed':
        return 'text-nbac-gold-light border-nbac-gold/20 bg-nbac-gold/5';
      case 'deleted':
        return 'text-nbac-danger border-nbac-danger/20 bg-nbac-danger/5';
      case 'published':
        return 'text-nbac-emerald-light border-nbac-emerald/20 bg-nbac-emerald/5';
      case 'edited':
        return 'text-nbac-gold border-nbac-gold/20 bg-nbac-gold/5';
      default:
        return 'text-nbac-text border-nbac-border bg-nbac-panel';
    }
  };

  return (
    <div className="space-y-6">
      <RoleBanner />

      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="font-sans text-xs uppercase tracking-widest font-semibold text-nbac-gold-light">
            Administrative Audit Vault
          </span>
          <h2 className="font-display text-2xl font-bold text-nbac-text mt-1">
            System Operations Log
          </h2>
        </div>
        
        {/* Filter Dropdown */}
        <div className="w-full sm:w-48">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="w-full bg-[#0b0f10]/60 border border-nbac-border rounded-lg px-4 py-2 text-nbac-text font-sans text-sm focus:outline-none focus:border-nbac-gold focus:ring-1 focus:ring-nbac-gold transition-colors"
          >
            <option value="all">All Actions</option>
            <option value="login">Logins</option>
            <option value="published">Publishing</option>
            <option value="edited">Edits</option>
            <option value="deleted">Deletions</option>
            <option value="permission_changed">Permissions</option>
          </select>
        </div>
      </div>

      {/* Log list grid */}
      <div className="bg-nbac-panel border border-nbac-border rounded-lg overflow-hidden select-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-nbac-border bg-[#0b0f10]/30 font-sans text-xs uppercase tracking-wider font-semibold text-nbac-muted">
                <th className="p-4 pl-6">Admin User</th>
                <th className="p-4">Action</th>
                <th className="p-4">Description</th>
                <th className="p-4">IP Address</th>
                <th className="p-4 pr-6">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nbac-border font-sans text-sm font-light">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-nbac-muted font-sans font-light">
                    <div className="flex justify-center items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-nbac-emerald border-t-transparent" />
                      <span>Syncing operations log...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-nbac-canvas/40 transition-colors">
                    <td className="p-4 pl-6 font-medium text-nbac-text">
                      <div className="flex items-center gap-2">
                        <Terminal size={12} className="text-nbac-gold" />
                        <span>{log.admin}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] uppercase font-semibold tracking-wider border px-2 py-0.5 rounded ${getActionBadgeColor(log.action)}`}>
                        {log.action.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-nbac-body">
                      {log.target}
                    </td>
                    <td className="p-4 text-nbac-muted text-xs font-mono">
                      {log.ip}
                    </td>
                    <td className="p-4 pr-6 text-nbac-muted text-xs font-mono">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={11} />
                        <span>{log.date}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-nbac-muted font-sans font-light">
                    No security logs match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
