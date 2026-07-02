'use client';

import React, { useState } from 'react';
import { ShieldAlert, ShieldX, Key, Terminal, Calendar } from 'lucide-react';
import { useAdminRole } from '@/hooks/use-admin-role';
import { RoleBanner } from '@/components/admin/role-banner';

interface MockLog {
  id: string;
  admin: string;
  role: string;
  action: 'login' | 'published' | 'edited' | 'deleted' | 'permission_changed';
  target: string;
  ip: string;
  date: string;
}

const mockLogs: MockLog[] = [
  {
    id: 'log_1',
    admin: 'chief.admin@nbac.com.ng',
    role: 'Head Admin',
    action: 'login',
    target: 'Successful admin login credentials session verified',
    ip: '197.210.64.12',
    date: '2026-06-29 12:05'
  },
  {
    id: 'log_2',
    admin: 'staff.editor@nbac.com.ng',
    role: 'Editor',
    action: 'edited',
    target: 'Updated Speaker Committee bios on events page content',
    ip: '102.89.43.195',
    date: '2026-06-29 11:15'
  },
  {
    id: 'log_3',
    admin: 'chief.admin@nbac.com.ng',
    role: 'Head Admin',
    action: 'deleted',
    target: 'Removed duplicate registration: Ref NBAC-2026-VIP-00219',
    ip: '197.210.64.12',
    date: '2026-06-29 10:42'
  },
  {
    id: 'log_4',
    admin: 'chief.admin@nbac.com.ng',
    role: 'Head Admin',
    action: 'permission_changed',
    target: 'Elevated staff.editor@nbac.com.ng write token authorizations',
    ip: '197.210.64.12',
    date: '2026-06-28 09:30'
  }
];

export default function SecurityLogsPage() {
  const { isHeadAdmin } = useAdminRole();
  const [filterAction, setFilterAction] = useState<string>('all');

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

  const filteredLogs = mockLogs.filter(log => filterAction === 'all' || log.action === filterAction);

  const getActionBadgeColor = (action: MockLog['action']) => {
    switch (action) {
      case 'login':
        return 'text-nbac-emerald-light border-nbac-emerald/10 bg-nbac-emerald/5';
      case 'permission_changed':
        return 'text-nbac-gold-light border-nbac-gold/20 bg-nbac-gold/5';
      case 'deleted':
        return 'text-nbac-danger border-nbac-danger/20 bg-nbac-danger/5';
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
              {filteredLogs.map((log) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
