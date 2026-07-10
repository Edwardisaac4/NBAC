'use client';

import React, { useState, useEffect } from 'react';
import { FileDown, Search, ArrowUpRight, CheckCircle2, AlertCircle, XCircle, X } from 'lucide-react';
import { useAdminRole } from '@/hooks/use-admin-role';
import { RoleBanner } from '@/components/admin/role-banner';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/shared/toast';

interface DBRegistration {
  id: string;
  name: string;
  email: string;
  company: string;
  tier: string;
  status: 'paid' | 'pending' | 'cancelled';
  reference: string;
  date: string;
  amount: string;
  specialRequirements: string;
  delegateCount: number;
}

const getCsvFilename = () => `nbac_reservations_${Date.now()}.csv`;

export default function ReservationsPage() {
  useAdminRole();
  const toast = useToast();
  const [registrations, setRegistrations] = useState<DBRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<DBRegistration | null>(null);

  useEffect(() => {
    let active = true;
    async function fetchReservations() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('reservations')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Failed to fetch reservations from Supabase:', error.message);
          return;
        }

        if (active && data) {
          const mapped: DBRegistration[] = (data as {
            id: string;
            name: string;
            email: string;
            company: string;
            tier: string;
            status: DBRegistration['status'];
            reference: string;
            created_at: string;
            amount: number;
            special_requirements?: string;
            delegate_count?: number;
          }[]).map((row) => {
            const formattedAmount = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 0
            }).format(row.amount);
            
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
              name: row.name,
              email: row.email,
              company: row.company,
              tier: row.tier,
              status: row.status,
              reference: row.reference,
              date: formattedDate,
              amount: formattedAmount,
              specialRequirements: row.special_requirements || '',
              delegateCount: row.delegate_count || 1
            };
          });
          setRegistrations(mapped);
        }
      } catch (err) {
        console.error('Failed to load reservations:', err);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchReservations();
    return () => {
      active = false;
    };
  }, []);

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch = reg.name.toLowerCase().includes(search.toLowerCase()) || 
                          reg.email.toLowerCase().includes(search.toLowerCase()) ||
                          reg.company.toLowerCase().includes(search.toLowerCase());
    
    const matchesTier = selectedTier === 'all' || reg.tier.toLowerCase().includes(selectedTier.toLowerCase());
    
    return matchesSearch && matchesTier;
  });

  const handleExport = (format: 'xlsx' | 'csv') => {
    if (filteredRegistrations.length === 0) {
      toast.error('No data available to export.');
      return;
    }

    if (format === 'csv') {
      const headers = ['Name', 'Email', 'Company', 'Tier', 'Status', 'Reference', 'Amount', 'Date', 'Delegate Count', 'Special Requirements'];
      const csvRows = [headers.join(',')];
      
      for (const reg of filteredRegistrations) {
        const row = [
          `"${reg.name.replace(/"/g, '""')}"`,
          `"${reg.email.replace(/"/g, '""')}"`,
          `"${reg.company.replace(/"/g, '""')}"`,
          `"${reg.tier.replace(/"/g, '""')}"`,
          `"${reg.status}"`,
          `"${reg.reference}"`,
          `"${reg.amount.replace(/"/g, '""')}"`,
          `"${reg.date}"`,
          reg.delegateCount,
          `"${reg.specialRequirements.replace(/"/g, '""')}"`
        ];
        csvRows.push(row.join(','));
      }

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', getCsvFilename());
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.info('Exporting...', {
        description: 'Excel (.xlsx) format requires external server-side workbook libraries. Reverting to local CSV download.'
      });
      handleExport('csv');
    }
  };

  const getStatusBadge = (status: DBRegistration['status']) => {
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

  const getTierColor = (tier: string) => {
    if (tier.toLowerCase().includes('sponsor')) {
      return 'text-nbac-gold-light border-nbac-gold/30 bg-nbac-gold/10';
    }
    switch (tier) {
      case 'VIP Delegate Pass':
      case 'VIP Pass':
        return 'text-nbac-gold-light border-nbac-gold/20 bg-nbac-gold/5';
      case 'Jet Display Pass':
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
            placeholder="Search delegates, email, or company..."
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
            <option value="all">All Packages</option>
            <option value="vip">VIP Pass</option>
            <option value="exhibitor">Exhibitor Pass</option>
            <option value="jet">Jet Display</option>
            <option value="sponsor">Sponsors</option>
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-nbac-muted font-sans font-light">
                    <div className="flex justify-center items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-nbac-emerald border-t-transparent" />
                      <span>Syncing vault records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRegistrations.length > 0 ? (
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
                        onClick={() => setSelectedBooking(reg)}
                        className="text-nbac-gold-light hover:text-white border border-nbac-border hover:bg-nbac-gold/10 font-sans font-medium px-3.5 py-1.5 rounded-lg transition-colors text-xs flex items-center gap-1.5 ml-auto cursor-pointer"
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

      {/* Details Modal Overlay */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)}
              className="absolute inset-0 bg-[#070b0c]/80 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative w-full max-w-lg bg-nbac-panel border border-nbac-border rounded-xl p-6 shadow-2xl z-10 space-y-6 text-left"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-nbac-border pb-4">
                <div>
                  <span className="font-sans text-[10px] uppercase tracking-widest font-semibold text-nbac-gold-light">
                    Reservation File
                  </span>
                  <h3 className="font-display text-xl font-bold text-white mt-0.5">
                    Booking Reference: {selectedBooking.reference}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="bg-nbac-canvas border border-nbac-border hover:border-white p-1.5 rounded-full text-nbac-muted hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-2 gap-4 font-sans text-xs">
                <div>
                  <span className="text-nbac-muted block font-medium uppercase tracking-wider text-[9px] mb-1">Delegate Name</span>
                  <span className="text-white text-sm font-semibold">{selectedBooking.name}</span>
                </div>
                <div>
                  <span className="text-nbac-muted block font-medium uppercase tracking-wider text-[9px] mb-1">Company</span>
                  <span className="text-white text-sm font-semibold">{selectedBooking.company}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-nbac-muted block font-medium uppercase tracking-wider text-[9px] mb-1">Email Address</span>
                  <span className="text-white text-sm font-semibold break-all">{selectedBooking.email}</span>
                </div>
                <div>
                  <span className="text-nbac-muted block font-medium uppercase tracking-wider text-[9px] mb-1">Pass Tier</span>
                  <span className={`text-xs border px-2 py-0.5 rounded-md font-medium inline-block mt-0.5 ${getTierColor(selectedBooking.tier)}`}>
                    {selectedBooking.tier}
                  </span>
                </div>
                <div>
                  <span className="text-nbac-muted block font-medium uppercase tracking-wider text-[9px] mb-1">Delegates Count</span>
                  <span className="text-white text-sm font-semibold">{selectedBooking.delegateCount}</span>
                </div>
                <div>
                  <span className="text-nbac-muted block font-medium uppercase tracking-wider text-[9px] mb-1">Total Amount</span>
                  <span className="text-nbac-gold-light text-sm font-bold">{selectedBooking.amount}</span>
                </div>
                <div>
                  <span className="text-nbac-muted block font-medium uppercase tracking-wider text-[9px] mb-1">Registration Date</span>
                  <span className="text-white text-sm font-semibold">{selectedBooking.date}</span>
                </div>
                <div className="col-span-2 border-t border-nbac-border pt-3 mt-1">
                  <span className="text-nbac-muted block font-medium uppercase tracking-wider text-[9px] mb-1">Special Requirements</span>
                  <p className="text-nbac-body text-xs leading-relaxed bg-nbac-canvas border border-nbac-border rounded-lg p-2.5 mt-1 max-h-24 overflow-y-auto whitespace-pre-wrap">
                    {selectedBooking.specialRequirements || 'No special requirements specified.'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
