'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, AlertTriangle, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
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
        "bg-nbac-panel border rounded-lg p-5 transition-all duration-300 relative overflow-hidden group select-none",
        highlight 
          ? "border-nbac-gold/30 hover:border-nbac-gold/60 shadow-lg hover:shadow-nbac-gold/5" 
          : "border-nbac-border hover:border-nbac-emerald/40 hover:shadow-lg hover:shadow-nbac-emerald/5"
      )}
    >
      {/* Background Decorative Gradient for Highlighted Cards */}
      {highlight && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-nbac-gold/5 rounded-full blur-2xl pointer-events-none transition-opacity group-hover:bg-nbac-gold/10" />
      )}

      <div className="flex items-start justify-between mb-3">
        {/* Title */}
        <span className="font-sans text-xs uppercase tracking-widest font-semibold text-nbac-muted">
          {title}
        </span>

        {/* Top Right Icon / Indicator */}
        {trend && !trend.isWarning ? (
          trend.isPositive ? (
            <ArrowUpRight size={18} className={cn("text-nbac-emerald", highlight && "text-nbac-gold-light")} />
          ) : (
            <ArrowDownRight size={18} className="text-nbac-danger" />
          )
        ) : trend?.isWarning ? (
          <AlertTriangle size={18} className="text-nbac-amber" />
        ) : Icon ? (
          <Icon size={18} className="text-nbac-muted" />
        ) : null}
      </div>

      {/* Primary Value */}
      <div className="mb-2">
        <span 
          className={cn(
            "font-sans text-3xl font-bold tracking-tight text-nbac-text",
            highlight && "text-glow text-nbac-gold-light"
          )}
        >
          {value}
        </span>
      </div>

      {/* Footer / Trend Info */}
      {trend && (
        <div className="flex items-center gap-1 font-sans text-xs">
          <span 
            className={cn(
              "font-medium",
              trend.isWarning 
                ? "text-nbac-amber" 
                : trend.isPositive 
                  ? (highlight ? "text-nbac-gold-light" : "text-nbac-emerald") 
                  : "text-nbac-danger"
            )}
          >
            {trend.value}
          </span>
          {!trend.isWarning && (
            <span className="text-nbac-muted">vs last month</span>
          )}
        </div>
      )}
    </div>
  );
}
