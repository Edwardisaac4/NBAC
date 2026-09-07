'use client';

import React, { useState, useEffect } from 'react';
import { RoleBanner } from '@/components/admin/role-banner';
import { KpiCard } from '@/components/admin/kpi-card';
import { RegistrationsChart, RegistrationRecord } from '@/components/admin/registrations-chart';
import { RecentActivity, ActivityItem } from '@/components/admin/recent-activity';
import { FeatureCard } from '@/components/admin/feature-card';
import { CreditCard, Users, CheckCircle, Clock, Award, Ticket, Handshake, FileText, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ReservationStatRow {
  delegate_count: number | null;
  amount: number | string | null;
  status: string | null;
  created_at: string;
}

/** Signed delta rendered under a KPI, or null when there is nothing to compare. */
function monthOverMonthTrend(current: number, previous: number) {
  const delta = current - previous;
  if (current === 0 && previous === 0) return { value: 'No activity yet' };
  if (delta === 0) return { value: 'Level with last month', isPositive: true };
  return {
    value: `${delta > 0 ? '+' : ''}${delta.toLocaleString()} vs last month`,
    isPositive: delta > 0,
  };
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
    earlyBirdCount: 0,
    ticketTiersCount: 0,
    sponsorTiersCount: 0,
    postsCount: 0
  });
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [registrationRecords, setRegistrationRecords] = useState<RegistrationRecord[]>([]);
  const [trends, setTrends] = useState<{
    registrations: { value: string; isPositive?: boolean };
    revenue: { value: string; isPositive?: boolean };
  }>({
    registrations: { value: 'No activity yet' },
    revenue: { value: 'No activity yet' },
  });

  useEffect(() => {
    let active = true;

    async function loadDashboardData() {
      try {
        const supabase = createClient();

        // 1. Fetch every reservation once. These rows drive the KPI totals, the
        //    month-over-month deltas and the chart, so there is a single source of
        //    truth instead of a view and a client-side fallback that can disagree.
        const { data: reservationRows, error: resError } = await supabase
          .from('reservations')
          .select('delegate_count, amount, status, created_at');

        if (resError) {
          console.error('Error fetching reservations:', resError.message);
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
        let ebCount = 0;
        let tCount = 0;
        let sCount = 0;
        let pCount = 0;

        try {
          const { count: ac } = await supabase.from('aerolab_applications').select('*', { count: 'exact', head: true });
          if (ac !== null && ac !== undefined) aeroCount = ac;
        } catch {
          // ignore
        }

        try {
          const { count: ebc } = await supabase.from('interests').select('*', { count: 'exact', head: true });
          if (ebc !== null && ebc !== undefined) ebCount = ebc;
        } catch {
          // ignore
        }

        try {
          const { count: tc } = await supabase.from('ticket_tiers').select('*', { count: 'exact', head: true });
          if (tc !== null && tc !== undefined) tCount = tc;
        } catch {
          // ignore
        }

        try {
          const { count: sc } = await supabase.from('sponsor_tiers_db').select('*', { count: 'exact', head: true });
          if (sc !== null && sc !== undefined) sCount = sc;
        } catch {
          // ignore
        }

        try {
          const { count: pc } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published');
          if (pc !== null && pc !== undefined) pCount = pc;
        } catch {
          // ignore
        }

        if (!active) return;

        // Compute stats. An explicit delegate_count of 0 is preserved; only
        // null/undefined falls back to a single seat.
        const rows: ReservationStatRow[] = reservationRows ?? [];

        let totalReg = 0;
        let confirmed = 0;
        let pending = 0;
        let revenueSum = 0;

        // Month-over-month comparison windows
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        let regThisMonth = 0;
        let regLastMonth = 0;
        let revThisMonth = 0;
        let revLastMonth = 0;

        rows.forEach((row) => {
          const count = row.delegate_count ?? 1;
          const amount = Number(row.amount ?? 0);
          totalReg += count;

          if (row.status === 'paid') {
            confirmed += count;
            revenueSum += amount;
          } else if (row.status === 'pending') {
            pending += count;
          }

          const created = new Date(row.created_at);
          if (created >= thisMonthStart) {
            regThisMonth += count;
            if (row.status === 'paid') revThisMonth += amount;
          } else if (created >= lastMonthStart) {
            regLastMonth += count;
            if (row.status === 'paid') revLastMonth += amount;
          }
        });

        setRegistrationRecords(
          rows.map((row) => ({
            created_at: row.created_at,
            delegate_count: row.delegate_count,
          }))
        );

        setTrends({
          registrations: monthOverMonthTrend(regThisMonth, regLastMonth),
          revenue: monthOverMonthTrend(revThisMonth, revLastMonth),
        });

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
          earlyBirdCount: ebCount,
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
    <div className="space-y-5 sm:space-y-6">
      {/* Role Warning Banner (only displays if role = head_admin) */}
      <RoleBanner />

      {/* KPI Cards Grid — 2-up on phones so all four stay above the fold */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        <KpiCard 
          title="Total Registrations"
          value={loading ? '...' : stats.totalRegistrations.toLocaleString()}
          icon={Users}
          trend={loading ? undefined : trends.registrations}
        />
        <KpiCard 
          title="Confirmed Bookings"
          value={loading ? '...' : stats.confirmedBookings.toLocaleString()}
          icon={CheckCircle}
          trend={
            loading
              ? undefined
              : {
                  value: `${stats.confirmedBookings} of ${stats.totalRegistrations} seats paid`,
                  isPositive: stats.confirmedBookings > 0,
                }
          }
        />
        <KpiCard 
          title="Pending Payments"
          value={loading ? '...' : stats.pendingPayments.toLocaleString()}
          icon={Clock}
          trend={
            loading
              ? undefined
              : stats.pendingPayments > 0
                ? { value: 'Awaiting payment', isWarning: true }
                : { value: 'Nothing outstanding', isPositive: true }
          }
        />
        <KpiCard 
          title="Revenue to Date"
          value={loading ? '...' : stats.revenue}
          icon={CreditCard}
          trend={loading ? undefined : trends.revenue}
          highlight={true} // Apply luxury gold theme
        />
      </div>

      {/* Analytics Graph & Activity Feed Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
        {/* SVG Curve Chart (3/5 width on large screens) */}
        <div className="lg:col-span-3 min-w-0">
          <RegistrationsChart records={registrationRecords} loading={loading} />
        </div>

        {/* Recent Activity Feed (2/5 width on large screens) */}
        <div className="lg:col-span-2 min-w-0">
          {loading ? (
            <div className="bg-nbac-panel border border-nbac-border rounded-lg p-8 flex flex-col items-center justify-center min-h-40 h-full select-none text-nbac-muted font-sans text-xs">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-nbac-emerald border-t-transparent mb-2" />
              <span>Syncing feed activity...</span>
            </div>
          ) : (
            <RecentActivity items={activities} />
          )}
        </div>
      </div>

      {/* Dynamic System Features Grid */}
      <div className="space-y-3.5 sm:space-y-4 pt-1 sm:pt-2">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <h3 className="font-display text-base sm:text-lg font-bold text-nbac-text">
            Dynamic System Features
          </h3>
          <span className="font-sans text-[11px] sm:text-xs text-nbac-muted">
            Live database records & content modules
          </span>
        </div>

        {/* 5 cards: 2-up on phones, 5-up on xl so the last one isn't orphaned on its own row */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
          <FeatureCard
            href="/admin/early-birds"
            icon={Sparkles}
            accent="gold"
            value={loading ? '...' : stats.earlyBirdCount}
            label="Early Bird Leads"
            hint="Interest forms & discount codes"
          />

          <FeatureCard
            href="/admin/aerolab"
            icon={Award}
            accent="emerald"
            value={loading ? '...' : stats.aerolabCount}
            label="AeroLab Submissions"
            hint="Hackathon intake & proposals"
          />

          <FeatureCard
            href="/admin/tickets"
            icon={Ticket}
            accent="blue"
            value={loading ? '...' : stats.ticketTiersCount}
            label="Ticket Tiers"
            hint="Delegate pricing & perks"
          />

          <FeatureCard
            href="/admin/sponsors-manager"
            icon={Handshake}
            accent="gold"
            value={loading ? '...' : stats.sponsorTiersCount}
            label="Sponsor Packages"
            hint="Tier privileges & pricing"
          />

          <FeatureCard
            href="/admin/content"
            icon={FileText}
            accent="purple"
            value={loading ? '...' : stats.postsCount}
            label="Published Articles"
            hint="Content & press releases"
          />
        </div>
      </div>
    </div>
  );
}
