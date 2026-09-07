'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, AlertTriangle, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  /** Short, self-describing footer line, e.g. "+3 vs last month". Omit while loading. */
  trend?: {
    value: string;
    isPositive?: boolean;
    isWarning?: boolean;
  };
  highlight?: boolean; // If true, apply premium gold accents
}

export function KpiCard({ title, value, icon: Icon, trend, highlight = false }: KpiCardProps) {
  return (
    <div 
      className={cn(
        "bg-nbac-panel border rounded-lg p-3.5 sm:p-5 transition-all duration-300 relative overflow-hidden group select-none",
        highlight 
          ? "border-nbac-gold/30 hover:border-nbac-gold/60 shadow-lg hover:shadow-nbac-gold/5" 
          : "border-nbac-border hover:border-nbac-emerald/40 hover:shadow-lg hover:shadow-nbac-emerald/5"
      )}
    >
      {/* Background Decorative Gradient for Highlighted Cards */}
      {highlight && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-nbac-gold/5 rounded-full blur-2xl pointer-events-none transition-opacity group-hover:bg-nbac-gold/10" />
      )}

      <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
        {/* Title — wraps inside the narrow 2-up mobile grid instead of overflowing */}
        <span className="font-sans text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest font-semibold text-nbac-muted leading-tight min-w-0">
          {title}
        </span>

        {/* Top Right Icon / Indicator */}
        {trend && !trend.isWarning ? (
          trend.isPositive ? (
            <ArrowUpRight className={cn("size-4 sm:size-[18px] shrink-0 text-nbac-emerald", highlight && "text-nbac-gold-light")} />
          ) : (
            <ArrowDownRight className="size-4 sm:size-[18px] shrink-0 text-nbac-danger" />
          )
        ) : trend?.isWarning ? (
          <AlertTriangle className="size-4 sm:size-[18px] shrink-0 text-nbac-amber" />
        ) : Icon ? (
          <Icon className="size-4 sm:size-[18px] shrink-0 text-nbac-muted" />
        ) : null}
      </div>

      {/* Primary Value */}
      <div className="mb-1.5 sm:mb-2">
        <span 
          className={cn(
            "block font-sans text-2xl sm:text-3xl font-bold tracking-tight text-nbac-text tabular-nums leading-none truncate",
            highlight && "text-glow text-nbac-gold-light"
          )}
        >
          {value}
        </span>
      </div>

      {/* Footer / Trend Info */}
      {trend && (
        <div className="flex items-center gap-1 font-sans text-[10px] sm:text-xs min-w-0">
          <span 
            className={cn(
              "font-medium leading-tight",
              trend.isWarning 
                ? "text-nbac-amber" 
                : trend.isPositive 
                  ? (highlight ? "text-nbac-gold-light" : "text-nbac-emerald") 
                  : "text-nbac-danger"
            )}
          >
            {trend.value}
          </span>
        </div>
      )}
    </div>
  );
}
