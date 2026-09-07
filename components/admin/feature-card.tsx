'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FeatureAccent = 'gold' | 'emerald' | 'blue' | 'purple';

const ACCENTS: Record<FeatureAccent, { card: string; icon: string; arrow: string }> = {
  gold: {
    card: 'hover:border-nbac-gold/50 hover:shadow-nbac-gold/5',
    icon: 'bg-nbac-gold/10 text-nbac-gold-light',
    arrow: 'group-hover:text-nbac-gold-light',
  },
  emerald: {
    card: 'hover:border-nbac-emerald/50 hover:shadow-nbac-emerald/5',
    icon: 'bg-nbac-emerald/10 text-nbac-emerald-light',
    arrow: 'group-hover:text-nbac-emerald-light',
  },
  blue: {
    card: 'hover:border-blue-500/50 hover:shadow-blue-500/5',
    icon: 'bg-blue-500/10 text-blue-400',
    arrow: 'group-hover:text-blue-400',
  },
  purple: {
    card: 'hover:border-purple-500/50 hover:shadow-purple-500/5',
    icon: 'bg-purple-500/10 text-purple-400',
    arrow: 'group-hover:text-purple-400',
  },
};

interface FeatureCardProps {
  href: string;
  icon: LucideIcon;
  accent: FeatureAccent;
  value: React.ReactNode;
  label: string;
  /** Supporting line — hidden on phones, where the count and label carry the meaning. */
  hint: string;
}

export function FeatureCard({ href, icon: Icon, accent, value, label, hint }: FeatureCardProps) {
  const tone = ACCENTS[accent];

  return (
    <Link
      href={href}
      className={cn(
        'group bg-nbac-panel border border-nbac-border rounded-lg p-3.5 sm:p-5 transition-all duration-300 hover:shadow-lg flex flex-col justify-between gap-3 active:scale-[0.99]',
        tone.card
      )}
    >
      <div className="flex items-center justify-between">
        <div className={cn('p-2 sm:p-2.5 rounded-lg shrink-0', tone.icon)}>
          <Icon className="size-[18px] sm:size-5" />
        </div>
        <ArrowRight
          className={cn(
            'size-4 shrink-0 text-nbac-muted transition-all group-hover:translate-x-1',
            tone.arrow
          )}
        />
      </div>

      <div className="min-w-0">
        <div className="font-display text-xl sm:text-2xl font-bold text-nbac-text tabular-nums leading-none mb-1.5">
          {value}
        </div>
        <div className="font-sans text-xs sm:text-sm font-medium text-nbac-text leading-snug">
          {label}
        </div>
        <div className="hidden sm:block font-sans text-xs text-nbac-muted mt-0.5">
          {hint}
        </div>
      </div>
    </Link>
  );
}
