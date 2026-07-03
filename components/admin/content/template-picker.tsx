'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Megaphone, Newspaper, Handshake, Calendar, FileText, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { PostTemplate } from '@/types';

interface TemplateCard {
  id: PostTemplate;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

const TEMPLATES: TemplateCard[] = [
  {
    id: 'announcement',
    label: 'Announcement',
    description: 'Share news or updates with conference attendees',
    icon: Megaphone,
  },
  {
    id: 'press_release',
    label: 'Press Release',
    description: 'Write something for media publications and journalists',
    icon: Newspaper,
  },
  {
    id: 'sponsor_update',
    label: 'Sponsor Update',
    description: 'Send targeted news to event sponsors and partners',
    icon: Handshake,
  },
  {
    id: 'event_copy',
    label: 'Event Copy',
    description: 'Describe sessions, aircraft displays, or VIP experiences',
    icon: Calendar,
  },
  {
    id: 'blank',
    label: 'Start from Scratch',
    description: 'Blank post — write anything in your own format',
    icon: FileText,
  },
];

export function TemplatePicker() {
  const router = useRouter();
  const [selected, setSelected] = useState<PostTemplate | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    router.push(`/admin/content/new/editor?template=${selected}`);
  };

  return (
    <div className="min-h-[75vh] flex flex-col justify-center py-10 px-4 select-none">
      <div className="max-w-4xl mx-auto w-full space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="font-sans text-xs uppercase tracking-widest font-medium text-nbac-emerald-light">
            Content Creation Vault
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
            What would you like to create?
          </h1>
          <p className="font-sans text-sm text-nbac-muted max-w-lg mx-auto">
            Choose a post type to get started. You can change it later.
          </p>
        </div>

        {/* 2-Column Grid with centered last element */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {TEMPLATES.slice(0, 4).map((card) => {
            const IconComponent = card.icon;
            const isSelected = selected === card.id;

            return (
              <motion.div
                key={card.id}
                onClick={() => setSelected(card.id)}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'relative bg-nbac-panel border rounded-xl p-6 flex gap-4 items-start cursor-pointer transition-all duration-300',
                  isSelected
                    ? 'border-2 border-nbac-emerald shadow-[0_0_0_3px_rgba(16,185,129,0.15)] bg-nbac-emerald/5'
                    : 'border-nbac-border hover:border-nbac-emerald/50'
                )}
              >
                {/* Selected Checkmark Badge */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-nbac-emerald flex items-center justify-center text-white">
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}

                {/* Icon Wrapper */}
                <div
                  className={cn(
                    'w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-300',
                    isSelected
                      ? 'bg-nbac-emerald/10 border-nbac-emerald/30 text-nbac-emerald'
                      : 'bg-nbac-alt border-nbac-border text-nbac-muted'
                  )}
                >
                  <IconComponent className={isSelected ? 'text-nbac-emerald' : 'text-nbac-muted'} size={24} />
                </div>

                {/* Info */}
                <div className="space-y-1 pr-4">
                  <h3 className="font-sans font-semibold text-base text-white">
                    {card.label}
                  </h3>
                  <p className="font-sans text-xs text-nbac-muted leading-relaxed font-light">
                    {card.description}
                  </p>
                </div>
              </motion.div>
            );
          })}

          {/* Centered Blank Card in its own centered space spanning both columns on desktop */}
          <div className="col-span-1 md:col-span-2 flex justify-center mt-1">
            {TEMPLATES.slice(4).map((card) => {
              const IconComponent = card.icon;
              const isSelected = selected === card.id;

              return (
                <motion.div
                  key={card.id}
                  onClick={() => setSelected(card.id)}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    'relative bg-nbac-panel border rounded-xl p-6 flex gap-4 items-start cursor-pointer transition-all duration-300 w-full md:w-1/2',
                    isSelected
                      ? 'border-2 border-nbac-emerald shadow-[0_0_0_3px_rgba(16,185,129,0.15)] bg-nbac-emerald/5'
                      : 'border-nbac-border hover:border-nbac-emerald/50'
                  )}
                >
                  {/* Selected Checkmark Badge */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-nbac-emerald flex items-center justify-center text-white">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}

                  {/* Icon Wrapper */}
                  <div
                    className={cn(
                      'w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-300',
                      isSelected
                        ? 'bg-nbac-emerald/10 border-nbac-emerald/30 text-nbac-emerald'
                        : 'bg-nbac-alt border-nbac-border text-nbac-muted'
                    )}
                  >
                    <IconComponent className={isSelected ? 'text-nbac-emerald' : 'text-nbac-muted'} size={24} />
                  </div>

                  {/* Info */}
                  <div className="space-y-1 pr-4">
                    <h3 className="font-sans font-semibold text-base text-white">
                      {card.label}
                    </h3>
                    <p className="font-sans text-xs text-nbac-muted leading-relaxed font-light">
                      {card.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center max-w-xs mx-auto">
          <button
            onClick={handleContinue}
            disabled={!selected}
            className={cn(
              'w-full py-3.5 px-6 rounded-full font-sans font-medium text-sm transition-all duration-300 shadow-lg cursor-pointer flex items-center justify-center gap-2',
              selected
                ? 'bg-nbac-emerald hover:bg-nbac-emerald-dark text-white shadow-nbac-emerald/20 hover:scale-[1.01]'
                : 'bg-nbac-panel border border-nbac-border text-nbac-muted cursor-not-allowed shadow-none'
            )}
          >
            <span>Continue to Editor</span>
            <span className="text-base">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
