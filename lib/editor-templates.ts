import type { PostTemplate } from '@/types';

export const EDITOR_TEMPLATES: Record<PostTemplate, { title: string; body: string }> = {
  announcement: {
    title: 'Announcement Title',
    body: `<h2>What's happening</h2>
<p>Write a clear, one-paragraph summary of the announcement here. Keep it direct.</p>
<h2>What this means for delegates</h2>
<p>Explain any action delegates need to take, or how this affects them.</p>
<h2>Contact</h2>
<p>For questions, reach out to <a href="mailto:info@nbac.com.ng">info@nbac.com.ng</a></p>`,
  },

  press_release: {
    title: 'Press Release Title',
    body: `<p><strong>FOR IMMEDIATE RELEASE</strong></p>
<p><em>Embargo date if applicable: DD Month YYYY</em></p>
<h2>Headline</h2>
<p>Opening paragraph — the most important information goes here. Answer who, what, when, where, why.</p>
<h2>More Detail</h2>
<p>Supporting information, quotes from organisers, background context.</p>
<h2>About NBAC</h2>
<p>The Nigerian Business Aviation Conference is West Africa's premier business aviation event...</p>
<p><strong>Media contact:</strong> press@nbac.com.ng</p>`,
  },

  sponsor_update: {
    title: 'Sponsor Update',
    body: `<p>Dear [Sponsor Name],</p>
<p>We are reaching out with an important update regarding your sponsorship of NBAC 2025.</p>
<h2>Update Details</h2>
<p>Write the key message here.</p>
<h2>What we need from you</h2>
<p>List any actions or requirements from the sponsor.</p>
<h2>Timeline</h2>
<p>Key dates and deadlines relevant to this update.</p>
<p>Thank you for your continued partnership.<br/>The NBAC Team</p>`,
  },

  event_copy: {
    title: 'Session or Display Title',
    body: `<h2>Overview</h2>
<p>Describe this session, aircraft display, or VIP experience in two to three sentences.</p>
<h2>What to Expect</h2>
<p>Key highlights and what delegates will experience.</p>
<h2>Speakers / Participants</h2>
<p>List names, titles, and organisations involved.</p>
<h2>Logistics</h2>
<p>Date, time, location within the venue.</p>`,
  },

  blank: {
    title: '',
    body: '',
  },
};
