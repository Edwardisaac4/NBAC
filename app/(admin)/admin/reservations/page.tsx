'use client';

import React, { useState } from 'react';
import { Users, FileDown, Search, ArrowUpRight, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { useAdminRole } from '@/hooks/use-admin-role';
import { RoleBanner } from '@/components/admin/role-banner';

interface MockRegistration {
  id: string;
  name: string;
  email: string;
  company: string;
  tier: 'VIP Pass' | 'Exhibitor Pass' | 'Jet Display';
  status: 'paid' | 'pending' | 'cancelled';
  reference: string;
  date: string;
  amount: string;
}

const initialRegistrations: MockRegistration[] = [
  {
    id: 'reg_1',
    name: 'Dr. Akin Adewale',
    email: 'akin.adewale@horizonair.ng',
    company: 'Horizon Aviation Services',
    tier: 'VIP Pass',
    status: 'paid',
    reference: 'NBAC-2026-VIP-00431',
    date: '2026-06-29 12:00',
    amount: '₦500,000'
  },
  {
    id: 'reg_2',
    name: 'Engr. Chukwuemeka Obi',
    email: 'c.obi@obi-jets.com',
    company: 'Obi Corporate Charters',
    tier: 'Jet Display',
    status: 'paid',
    reference: 'NBAC-2026-JET-00104',
    date: '2026-06-29 11:51',
    amount: '₦1,200,000'
  },
  {
    id: 'reg_3',
    name: 'Amina Bello',
    email: 'amina.bello@regulator.gov.ng',
    company: 'NCAA Aviation Board',
    tier: 'Exhibitor Pass',
    status: 'pending',
    reference: 'NBAC-2026-EXH-00085',
    date: '2026-06-29 08:30',
    amount: '₦350,000'
  },
  {
    id: 'reg_4',
    name: 'Marcus Vance',
    email: 'vance@gulfstream-brokerage.com',
    company: 'Gulfstream Aero Brokerage',
    tier: 'VIP Pass',
    status: 'cancelled',
    reference: 'NBAC-2026-VIP-00389',
    date: '2026-06-28 15:45',
    amount: '₦500,000'
  }
];

export default function ReservationsPage() {
  const { isHeadAdmin } = useAdminRole();
  const [registrations, setRegistrations] = useState<MockRegistration[]>(initialRegistrations);
  const [search, setSearch] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch = reg.name.toLowerCase().includes(search.toLowerCase()) || 
                          reg.email.toLowerCase().includes(search.toLowerCase()) ||
                          reg.company.toLowerCase().includes(search.toLowerCase());
    
    const matchesTier = selectedTier === 'all' || reg.tier.toLowerCase().includes(selectedTier.toLowerCase());
    
    return matchesSearch && matchesTier;
  });

  const handleExport = (format: 'xlsx' | 'csv') => {
    alert(`Exporting ${filteredRegistrations.length} registrations as .${format}...\nRoute triggered: /api/admin/export/registrations?format=${format}`);
  };

  const getStatusBadge = (status: MockRegistration['status']) => {
    switch (status) {
      case 'paid':
        return (
          <span className="bg-nbac-emerald/15 text-nbac-emerald text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
            <CheckCircle2 size={10} />
            <span>Paid</span>
          </span>
        );
      case 'pending':
        return (
          <span className="bg-nbac-amber/15 text-nbac-amber text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
            <AlertCircle size={10} />
            <span>Pending</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-nbac-danger/15 text-nbac-danger text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
            <XCircle size={10} />
            <span>Cancelled</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getTierColor = (tier: MockRegistration['tier']) => {
    switch (tier) {
      case 'VIP Pass':
        return 'text-nbac-gold-light border-nbac-gold/20 bg-nbac-gold/5';
      case 'Jet Display':
        return 'text-nbac-emerald-light border-nbac-emerald/20 bg-nbac-emerald/5';
      default:
        return 'text-nbac-text border-nbac-border bg-nbac-panel';
    }
  };

  return (
    <div className="space-y-6">
      <RoleBanner />

      {/* Header and Export Tools */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="font-sans text-xs uppercase tracking-widest font-semibold text-nbac-gold-light">
            Secure Delegate Records
          </span>
          <h2 className="font-display text-2xl font-bold text-nbac-text mt-1">
            Reservations intake Vault
          </h2>
        </div>
        
        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('xlsx')}
            className="border border-nbac-border hover:border-nbac-gold/30 text-nbac-body hover:text-nbac-gold-light bg-[#0b0f10]/60 font-sans font-medium px-4 py-2 rounded-lg transition-colors text-xs flex items-center gap-2 cursor-pointer"
          >
            <FileDown size={14} />
            <span>Excel Export</span>
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="border border-nbac-border hover:border-nbac-gold/30 text-nbac-body hover:text-nbac-gold-light bg-[#0b0f10]/60 font-sans font-medium px-4 py-2 rounded-lg transition-colors text-xs flex items-center gap-2 cursor-pointer"
          >
            <FileDown size={14} />
            <span>CSV Export</span>
          </button>
        </div>
      </div>

      {/* Search & Filtering Strip */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search delegates, email, or aircraft company..."
            className="w-full bg-[#0b0f10]/60 border border-nbac-border rounded-lg pl-10 pr-4 py-2.5 text-nbac-text placeholder:text-nbac-muted font-sans text-sm focus:outline-none focus:border-nbac-gold focus:ring-1 focus:ring-nbac-gold transition-colors"
          />
          <Search className="absolute left-3.5 top-3 text-nbac-muted" size={16} />
        </div>
        
        {/* Tier dropdown filter */}
        <div className="w-full md:w-56">
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="w-full bg-[#0b0f10]/60 border border-nbac-border rounded-lg px-4 py-2.5 text-nbac-text font-sans text-sm focus:outline-none focus:border-nbac-gold focus:ring-1 focus:ring-nbac-gold transition-colors"
          >
            <option value="all">All Pass Tiers</option>
            <option value="vip">VIP Pass</option>
            <option value="exhibitor">Exhibitor Pass</option>
            <option value="jet">Jet Display</option>
          </select>
        </div>
      </div>

      {/* Grid records table */}
      <div className="bg-nbac-panel border border-nbac-border rounded-lg overflow-hidden select-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-nbac-border bg-[#0b0f10]/30 font-sans text-xs uppercase tracking-wider font-semibold text-nbac-muted">
                <th className="p-4 pl-6">Delegate</th>
                <th className="p-4">Pass Tier</th>
                <th className="p-4">Status</th>
                <th className="p-4">Reference</th>
                <th className="p-4">Cost</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nbac-border font-sans text-sm">
              {filteredRegistrations.length > 0 ? (
                filteredRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-nbac-canvas/40 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-medium text-nbac-text">{reg.name}</div>
                      <div className="text-nbac-muted text-xs font-light">{reg.company} • {reg.email}</div>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs border px-2.5 py-1 rounded-md font-medium tracking-wide ${getTierColor(reg.tier)}`}>
                        {reg.tier}
                      </span>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(reg.status)}
                    </td>
                    <td className="p-4 text-nbac-body text-xs font-mono">
                      {reg.reference}
                    </td>
                    <td className="p-4 text-nbac-text font-semibold text-xs">
                      {reg.amount}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => alert(`Showing details for booking ${reg.reference}\nSpecial Requirements: None`)}
                        className="text-nbac-gold-light hover:text-white border border-nbac-border hover:bg-nbac-gold/10 font-sans font-medium px-3.5 py-1.5 rounded-lg transition-colors text-xs flex items-center gap-1.5 ml-auto"
                      >
                        <span>Details</span>
                        <ArrowUpRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-nbac-muted font-sans font-light">
                    No delegate records match your search criteria.
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
