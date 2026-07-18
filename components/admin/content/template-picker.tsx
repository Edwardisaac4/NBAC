'use client'

import { TEMPLATE_CARDS } from '@/lib/studio-templates'
import { cn }             from '@/lib/utils'
import type { PostTemplate } from '@/types'

interface TemplatePickerProps {
  selected: PostTemplate | null
  onSelect: (t: PostTemplate) => void
}

export function TemplatePicker({ selected, onSelect }: TemplatePickerProps) {
  return (
    <div className="bg-nbac-panel border-b border-nbac-border px-6 py-4 flex-shrink-0">
      <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
        {TEMPLATE_CARDS.map((card) => {
          const isSelected = selected === card.id
          return (
            <button
              key={card.id}
              onClick={() => onSelect(card.id)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl border text-left',
                'flex-shrink-0 transition-all duration-150 cursor-pointer',
                isSelected
                  ? 'bg-nbac-deep border-nbac-emerald shadow-sm shadow-nbac-emerald/10'
                  : 'bg-nbac-canvas border-nbac-border hover:border-nbac-body'
              )}
            >
              <span className="text-xl flex-shrink-0">{card.icon}</span>
              <div>
                <p className={cn(
                  'font-sans text-sm font-semibold',
                  isSelected ? 'text-nbac-emerald' : 'text-nbac-text'
                )}>
                  {card.label}
                </p>
                <p className="font-sans text-xs text-nbac-muted">
                  {card.descriptor}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
