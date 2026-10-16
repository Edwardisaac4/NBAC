/**
 * Shared vocabulary for journalist / media accreditation.
 *
 * Imported by the public form, the API route and the admin page so the three
 * cannot drift — the route rejects any media_type not listed here, and the
 * admin filter and badges label stored values from the same list.
 */

export const MEDIA_TYPES = [
  { value: 'print', label: 'Print / Newspaper' },
  { value: 'online', label: 'Online / Digital' },
  { value: 'television', label: 'Television' },
  { value: 'radio', label: 'Radio' },
  { value: 'photography', label: 'Photography' },
  { value: 'trade', label: 'Aviation Trade Press' },
  { value: 'podcast', label: 'Podcast / Blog' },
  { value: 'freelance', label: 'Freelance' },
] as const

export type MediaType = (typeof MEDIA_TYPES)[number]['value']

export const PRESS_STATUSES = ['pending', 'approved', 'declined'] as const

export type PressStatus = (typeof PRESS_STATUSES)[number]

export function mediaTypeLabel(value: string): string {
  return MEDIA_TYPES.find((t) => t.value === value)?.label ?? value
}
