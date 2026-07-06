'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface ActivityItem {
  id: string;
  type: 'registration_paid' | 'registration_pending' | 'payment_failed' | 'system_success' | 'system_alert';
  message: string;
  timestamp: string;
  meta?: {
    name?: string;
    detail?: string;
  };
}

interface RecentActivityProps {
  items: ActivityItem[];
}

export function RecentActivity({ items }: RecentActivityProps) {
  const getStatusColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'registration_paid':
      case 'system_success':
        return 'bg-nbac-emerald';
      case 'registration_pending':
      case 'system_alert':
        return 'bg-nbac-amber';
      case 'payment_failed':
        return 'bg-nbac-danger';
      default:
        return 'bg-nbac-muted';
    }
  };

  return (
    <div className="bg-nbac-panel border border-nbac-border rounded-lg p-5 flex flex-col h-full select-none">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-sans text-sm font-semibold text-nbac-text">
          Recent Activity Feed
        </h3>
        <Link 
          href="/admin/reservations" 
          className="font-sans text-xs text-nbac-muted hover:text-nbac-gold transition-colors"
        >
          View All
        </Link>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 items-start group">
            {/* Status Indicator Dot */}
            <div className="pt-1.5 shrink-0">
              <span className={cn("block w-2.5 h-2.5 rounded-full ring-4 ring-[#0b0f10]/15", getStatusColor(item.type))} />
            </div>

            {/* Description Details */}
            <div className="flex-1 min-w-0">
              <p className="font-sans text-sm text-nbac-body font-light leading-relaxed group-hover:text-nbac-text transition-colors duration-200">
                {renderFormattedMessage(item)}
              </p>
              <span className="font-sans text-xs text-nbac-muted block mt-1">
                {item.timestamp}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Utility to parse messages and apply bolding to key fields (like names, passes, packages)
function renderFormattedMessage(item: ActivityItem) {
  const parts = [];
  const text = item.message;
  
  // Highlight name if available
  const name = item.meta?.name;
  const detail = item.meta?.detail;
  
  if (name && text.includes(name)) {
    const nameIndex = text.indexOf(name);
    
    // Add prefix
    parts.push({ text: text.substring(0, nameIndex), bold: false });
    // Add bold name
    parts.push({ text: name, bold: true, color: 'text-nbac-text' });
    
    // Handle detail highlight if any
    const remainingText = text.substring(nameIndex + name.length);
    if (detail && remainingText.includes(detail)) {
      const detailIndex = remainingText.indexOf(detail);
      parts.push({ text: remainingText.substring(0, detailIndex), bold: false });
      parts.push({ 
        text: detail, 
        bold: true, 
        color: detail.includes('VIP') 
          ? 'text-nbac-gold-light' 
          : detail.includes('Jet Display') 
            ? 'text-nbac-emerald-light' 
            : 'text-nbac-text'
      });
      parts.push({ text: remainingText.substring(detailIndex + detail.length), bold: false });
    } else {
      parts.push({ text: remainingText, bold: false });
    }
  } else if (detail && text.includes(detail)) {
    const detailIndex = text.indexOf(detail);
    parts.push({ text: text.substring(0, detailIndex), bold: false });
    parts.push({ text: detail, bold: true, color: 'text-nbac-text' });
    parts.push({ text: text.substring(detailIndex + detail.length), bold: false });
  } else {
    // Default fallback
    return text;
  }

  return parts.map((part, i) => (
    <span 
      key={i} 
      className={cn(
        part.bold ? "font-semibold text-nbac-text" : "text-nbac-body", 
        part.color
      )}
    >
      {part.text}
    </span>
  ));
}
