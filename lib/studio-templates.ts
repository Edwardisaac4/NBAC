import type { PostTemplate, TemplateCardData } from '@/types'

export const TEMPLATE_CARDS: TemplateCardData[] = [
  {
    id:         'announcement',
    label:      'Announcement',
    descriptor: 'Clean editorial — headline and body',
    icon:       '📢',
  },
  {
    id:         'press_release',
    label:      'Press Release',
    descriptor: 'Formal media distribution format',
    icon:       '📰',
  },
  {
    id:         'visual_showcase',
    label:      'Visual Showcase',
    descriptor: 'Image-first storytelling',
    icon:       '🖼️',
  },
  {
    id:         'sponsor_update',
    label:      'Sponsor Update',
    descriptor: 'Targeted partner communications',
    icon:       '🤝',
  },
  {
    id:         'blank',
    label:      'Start from Scratch',
    descriptor: 'Blank post — write anything',
    icon:       '📄',
  },
]

export const TEMPLATE_CONTENT: Record<PostTemplate, { title: string; body: string }> = {
  announcement: {
    title: 'Announcement Title',
    body: `<h2>What's happening</h2>
<p>Write a clear, direct summary of the announcement here. One paragraph is enough to open with.</p>
<h2>What this means for delegates</h2>
<p>Explain any action delegates need to take, or how this affects their NBAC 2027 experience.</p>
<h2>Contact</h2>
<p>For questions, reach out to <a href="mailto:info@nbac.com.ng">info@nbac.com.ng</a></p>`,
  },

  press_release: {
    title: 'Press Release Title',
    body: `<p><strong>FOR IMMEDIATE RELEASE</strong></p>
<p><em>Embargo date if applicable: DD Month YYYY</em></p>
<h2>Headline</h2>
<p>Opening paragraph — the most important information goes here. Answer who, what, when, where, and why in the first two sentences.</p>
<h2>Detail</h2>
<p>Supporting information, quotes from organisers, and background context go here.</p>
<h2>About NBAC</h2>
<p>The Nigerian Business Aviation Conference is West Africa's premier business aviation event, bringing together operators, regulators, financiers, and innovators annually.</p>
<p><strong>Media contact:</strong> press@nbac.com.ng</p>`,
  },

  visual_showcase: {
    title: 'Visual Story Title',
    body: `<p>This template is image-led. Upload a strong cover image above, then let the writing support the visual.</p>
<p>Open with a compelling one-sentence hook that draws the reader into the story.</p>
<h2>The Story</h2>
<p>Write the full narrative here. This format works best for event recaps, speaker profiles, and venue features.</p>`,
  },

  sponsor_update: {
    title: 'Update for [Sponsor Name]',
    body: `<p>Dear [Sponsor Name],</p>
<p>We are writing with an important update regarding your partnership with NBAC 2027.</p>
<h2>Update Details</h2>
<p>Write the key message here — keep it direct and relevant to the sponsor's specific tier and commitments.</p>
<h2>What we need from you</h2>
<p>List any actions or requirements clearly.</p>
<h2>Key Dates</h2>
<p>Important deadlines and milestones for this update.</p>
<p>Thank you for your continued partnership.<br/>The NBAC 2027 Team</p>`,
  },

  event_copy: {
    title: 'Event Copy Title',
    body: `<h2>Event Highlight</h2>
<p>Details about the session, speaker, or agenda update.</p>`,
  },

  blank: {
    title: '',
    body:  '',
  },
}
