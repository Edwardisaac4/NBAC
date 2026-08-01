'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RoleBanner } from '@/components/admin/role-banner';
import { KpiCard } from '@/components/admin/kpi-card';
import { RegistrationsChart } from '@/components/admin/registrations-chart';
import { RecentActivity, ActivityItem } from '@/components/admin/recent-activity';
import { CreditCard, Users, CheckCircle, Clock, Award, Ticket, Handshake, FileText, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ReservationStatRow {
  delegate_count: number | null;
  amount: number | string | null;
  status: string | null;
  created_at: string;
}

interface RecentReservationRow {
  id: string | number;
  status: string | null;
  name: string | null;
  tier: string | null;
  created_at: string;
}

interface RecentAuditLogRow {
  id: string | number;
  action: string | null;
  admin_email: string | null;
  target: string | null;
  created_at: string;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${diffDay}d ago`;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    confirmedBookings: 0,
    pendingPayments: 0,
    revenue: '$0',
    aerolabCount: 0,
    ticketTiersCount: 4,
    sponsorTiersCount: 5,
    postsCount: 0
  });
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadDashboardData() {
      try {
        const supabase = createClient();

        // 1. Fetch registrations for KPI aggregation via reservation_kpis view
        const { data: kpiData, error: resError } = await supabase
          .from('reservation_kpis')
          .select('*')
          .single();

        if (resError) {
          console.error('Error fetching registrations stats:', resError.message);
        }

        // 2. Fetch recent reservations for feed
        const { data: recentRes, error: recentResError } = await supabase
          .from('reservations')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentResError) {
          console.error('Error fetching recent reservations:', recentResError.message);
        }

        // 3. Fetch recent audit logs for feed
        const { data: recentLogs, error: recentLogsError } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentLogsError) {
          console.error('Error fetching recent logs:', recentLogsError.message);
        }

        // 4. Fetch dynamic feature counts
        let aeroCount = 0;
        let tCount = 4;
        let sCount = 5;
        let pCount = 0;

        try {
          const { count: ac } = await supabase.from('aerolab_applications').select('*', { count: 'exact', head: true });
          if (ac !== null && ac !== undefined) aeroCount = ac;
        } catch {
          // ignore
        }

        try {
          const { count: tc } = await supabase.from('ticket_tiers').select('*', { count: 'exact', head: true });
          if (tc !== null && tc !== undefined && tc > 0) tCount = tc;
        } catch {
          // ignore
        }

        try {
          const { count: sc } = await supabase.from('sponsor_tiers_db').select('*', { count: 'exact', head: true });
          if (sc !== null && sc !== undefined && sc > 0) sCount = sc;
        } catch {
          // ignore
        }

        try {
          const { count: pc } = await supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('status', 'published');
          if (pc !== null && pc !== undefined) pCount = pc;
        } catch {
          // ignore
        }

        if (!active) return;

        // Compute stats
        let totalReg = 0;
        let confirmed = 0;
        let pending = 0;
        let revenueSum = 0;

        if (kpiData) {
          totalReg = Number(kpiData.total_registrations ?? 0);
          confirmed = Number(kpiData.confirmed_bookings ?? 0);
          pending = Number(kpiData.pending_payments ?? 0);
          revenueSum = Number(kpiData.total_revenue ?? 0);
        } else {
          // Fallback client-side aggregation (preserving explicit delegate_count of 0 and defaulting to 1 only for null or undefined values)
          const { data: allRes } = await supabase
            .from('reservations')
            .select('delegate_count, amount, status');
          if (allRes) {
            allRes.forEach((row: ReservationStatRow) => {
              const count = row.delegate_count ?? 1;
              totalReg += count;

              if (row.status === 'paid') {
                confirmed += count;
                revenueSum += Number(row.amount ?? 0);
              } else if (row.status === 'pending') {
                pending += count;
              }
            });
          }
        }

        const formattedRev = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0
        }).format(revenueSum);

        setStats({
          totalRegistrations: totalReg,
          confirmedBookings: confirmed,
          pendingPayments: pending,
          revenue: formattedRev,
          aerolabCount: aeroCount,
          ticketTiersCount: tCount,
          sponsorTiersCount: sCount,
          postsCount: pCount
        });

        // Assemble activities feed
        const feedItems: (ActivityItem & { date: Date })[] = [];

        if (recentRes) {
          recentRes.forEach((row: RecentReservationRow) => {
            feedItems.push({
              id: `res_${row.id}`,
              type: row.status === 'paid' ? 'registration_paid' : 'registration_pending',
              message: `${row.name || 'Unknown'} registered as ${row.tier || 'delegate'} holder.`,
              timestamp: formatRelativeTime(row.created_at),
              meta: {
                name: row.name ?? undefined,
                detail: row.tier ?? undefined
              },
              date: new Date(row.created_at)
            });
          });
        }

        if (recentLogs) {
          recentLogs.forEach((row: RecentAuditLogRow) => {
            let activityType: ActivityItem['type'] = 'system_success';
            if (row.action === 'deleted') activityType = 'system_alert';
            if (row.action === 'permission_changed') activityType = 'system_alert';
            
            feedItems.push({
              id: `log_${row.id}`,
              type: activityType,
              message: `${row.admin_email} executed ${row.action} - ${row.target}`,
              timestamp: formatRelativeTime(row.created_at),
              date: new Date(row.created_at)
            });
          });
        }

        // Sort combined feed by date descending
        feedItems.sort((a, b) => b.date.getTime() - a.date.getTime());

        setActivities(feedItems.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboardData();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Role Warning Banner (only displays if role = head_admin) */}
      <RoleBanner />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard 
          title="Total Registrations"
          value={loading ? '...' : stats.totalRegistrations.toLocaleString()}
          icon={Users}
          trend={{ value: "+ Live", isPositive: true }}
        />
        <KpiCard 
          title="Confirmed Bookings"
          value={loading ? '...' : stats.confirmedBookings.toLocaleString()}
          icon={CheckCircle}
          trend={{ value: "Active Seats", isPositive: true }}
        />
        <KpiCard 
          title="Pending Payments"
          value={loading ? '...' : stats.pendingPayments.toLocaleString()}
          icon={Clock}
          trend={{ value: "Awaiting Gateway", isWarning: stats.pendingPayments > 0 }}
        />
        <KpiCard 
          title="Revenue to Date"
          value={loading ? '...' : stats.revenue}
          icon={CreditCard}
          trend={{ value: "Gross USD", isPositive: true }}
          highlight={true} // Apply luxury gold theme
        />
      </div>

      {/* Analytics Graph & Activity Feed Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* SVG Curve Chart (3/5 width on large screens) */}
        <div className="lg:col-span-3">
          <RegistrationsChart />
        </div>

        {/* Recent Activity Feed (2/5 width on large screens) */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-nbac-panel border border-nbac-border rounded-lg p-8 flex flex-col items-center justify-center h-full select-none text-nbac-muted font-sans text-xs">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-nbac-emerald border-t-transparent mb-2" />
              <span>Syncing feed activity...</span>
            </div>
          ) : (
            <RecentActivity items={activities} />
          )}
        </div>
      </div>

      {/* Dynamic System Features Grid */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-nbac-text">
            Dynamic System Features
          </h3>
          <span className="font-sans text-xs text-nbac-muted">
            Live database records & content modules
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            href="/admin/aerolab" 
            className="group bg-nbac-panel border border-nbac-border hover:border-nbac-emerald/50 rounded-lg p-5 transition-all duration-300 hover:shadow-lg hover:shadow-nbac-emerald/5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-nbac-emerald/10 text-nbac-emerald-light">
                <Award size={20} />
              </div>
              <ArrowRight size={16} className="text-nbac-muted group-hover:text-nbac-emerald-light group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-nbac-text mb-1">
                {loading ? '...' : stats.aerolabCount}
              </div>
              <div className="font-sans text-sm font-medium text-nbac-text">
                AeroLab Submissions
              </div>
              <div className="font-sans text-xs text-nbac-muted mt-0.5">
                Hackathon intake & proposals
              </div>
            </div>
          </Link>

          <Link 
            href="/admin/tickets" 
            className="group bg-nbac-panel border border-nbac-border hover:border-nbac-emerald/50 rounded-lg p-5 transition-all duration-300 hover:shadow-lg hover:shadow-nbac-emerald/5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
                <Ticket size={20} />
              </div>
              <ArrowRight size={16} className="text-nbac-muted group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-nbac-text mb-1">
                {loading ? '...' : stats.ticketTiersCount}
              </div>
              <div className="font-sans text-sm font-medium text-nbac-text">
                Ticket Tiers
              </div>
              <div className="font-sans text-xs text-nbac-muted mt-0.5">
                Delegate pricing & perks
              </div>
            </div>
          </Link>

          <Link 
            href="/admin/sponsors-manager" 
            className="group bg-nbac-panel border border-nbac-border hover:border-nbac-gold/50 rounded-lg p-5 transition-all duration-300 hover:shadow-lg hover:shadow-nbac-gold/5 flex flex-col justify-between text-left"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-nbac-gold/10 text-nbac-gold">
                <Handshake size={20} />
              </div>
              <ArrowRight size={16} className="text-nbac-muted group-hover:text-nbac-gold group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-nbac-text mb-1">
                {loading ? '...' : stats.sponsorTiersCount}
              </div>
              <div className="font-sans text-sm font-medium text-nbac-text">
                Sponsor Packages
              </div>
              <div className="font-sans text-xs text-nbac-muted mt-0.5">
                Tier privileges & pricing
              </div>
            </div>
          </Link>

          <Link 
            href="/admin/content" 
            className="group bg-nbac-panel border border-nbac-border hover:border-purple-500/50 rounded-lg p-5 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
                <FileText size={20} />
              </div>
              <ArrowRight size={16} className="text-nbac-muted group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-nbac-text mb-1">
                {loading ? '...' : stats.postsCount}
              </div>
              <div className="font-sans text-sm font-medium text-nbac-text">
                Published Articles
              </div>
              <div className="font-sans text-xs text-nbac-muted mt-0.5">
                Content & press releases
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
