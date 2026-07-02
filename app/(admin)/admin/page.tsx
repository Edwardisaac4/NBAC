'use client';

import React from 'react';
import { RoleBanner } from '@/components/admin/role-banner';
import { KpiCard } from '@/components/admin/kpi-card';
import { RegistrationsChart } from '@/components/admin/registrations-chart';
import { RecentActivity, ActivityItem } from '@/components/admin/recent-activity';
import { CreditCard, Users, CheckCircle, Clock } from 'lucide-react';

const mockActivities: ActivityItem[] = [
  {
    id: 'act_1',
    type: 'registration_paid',
    message: 'Dr. Akin Adewale registered as VIP Pass holder.',
    timestamp: '3m ago',
    meta: {
      name: 'Dr. Akin Adewale',
      detail: 'VIP Pass'
    }
  },
  {
    id: 'act_2',
    type: 'registration_paid',
    message: 'Engr. Chukwuemeka Obi confirmed Jet Display slot.',
    timestamp: '12m ago',
    meta: {
      name: 'Engr. Chukwuemeka Obi',
      detail: 'Jet Display'
    }
  },
  {
    id: 'act_3',
    type: 'payment_failed',
    message: 'Payment failed for Aero Logistics Ltd sponsorship package.',
    timestamp: '45m ago',
    meta: {
      name: 'Aero Logistics Ltd',
      detail: 'Aero Logistics Ltd'
    }
  },
  {
    id: 'act_4',
    type: 'system_success',
    message: 'System automated backup completed successfully.',
    timestamp: '2h ago'
  }
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Role Warning Banner (only displays if role = head_admin) */}
      <RoleBanner />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard 
          title="Total Registrations"
          value="1,204"
          icon={Users}
          trend={{ value: "+12%", isPositive: true }}
        />
        <KpiCard 
          title="Confirmed Bookings"
          value="892"
          icon={CheckCircle}
          trend={{ value: "+5%", isPositive: true }}
        />
        <KpiCard 
          title="Pending Payments"
          value="156"
          icon={Clock}
          trend={{ value: "Action Required", isWarning: true }}
        />
        <KpiCard 
          title="Revenue to Date"
          value="$425,000"
          icon={CreditCard}
          trend={{ value: "+18%", isPositive: true }}
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
          <RecentActivity items={mockActivities} />
        </div>
      </div>
    </div>
  );
}
