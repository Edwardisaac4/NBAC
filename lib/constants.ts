import { CommitteeMember, SponsorTierDetails } from '@/types'

export interface SponsorAddOn {
  id: string;
  name: string;
  isNegotiable?: boolean;
  description: string;
}

export const STEERING_COMMITTEE_MEMBERS: CommitteeMember[] = [
  {
    name: 'Segun Demuren',
    role: 'CHAIRMAN',
    image: '/images/SD ! NBAC.jpg',
    objectPosition: 'top',
  },
  {
    name: 'Josephine Kolawole',
    role: 'HEAD, MARKETING',
    image: '/images/Josephine NBAC.jpg',
    objectPosition: 'top',
  },
  {
    name: 'Boyede Oyegbami',
    role: 'HEAD, SALES',
    image: '/images/Boyede NBAC.jpg',
    objectPosition: 'top',
  },
  {
    name: 'OluBukunola Hudeyin',
    role: 'HEAD, QUALITY AND SAFETY',
    image: '/images/Bukky NBAC.jpg',
    objectPosition: 'top',
  },
  {
    name: 'Tunde Awe',
    role: 'HEAD, PMO',
    image: '/images/Tunde Awe NBAC.jpg',
    objectPosition: 'top',
  },
  {
    name: 'Seye Fasuyi',
    role: 'HEAD, HUMAN RESOURCES',
    image: '/images/Seye NBAC.jpeg',
    objectPosition: 'top',
  },
  {
    name: 'Ann Umeh',
    role: 'HEAD, CLIENT RELATIONS',
    image: '/images/Ann umeh NBAC.jpg',
    objectPosition: 'top',
  },
  {
    name: 'Stephanie Leonard',
    role: 'MARKETING TEAM',
    image: '/images/Stephanie NBAC.jpeg',
    objectPosition: 'top',
  },
  {
    name: 'Christine Emanuwa',
    role: 'MARKETING TEAM',
    image: '/images/Christine NBAC.jpg',
    objectPosition: 'top',
  },
]

export const ABOUT_COMMITTEE_MEMBERS: CommitteeMember[] = [
  {
    name: 'Segun Demuren',
    role: 'CHAIRMAN',
    image: '/images/SD ! NBAC.jpg',
    objectPosition: 'top',
  },
  {
    name: 'Josephine Kolawole',
    role: 'HEAD, MARKETING',
    image: '/images/Josephine NBAC.jpg',
    objectPosition: 'top',
  },
  {
    name: 'Olubukunola Hudeyin',
    role: 'HEAD, QUALITY AND SAFETY',
    image: '/images/Bukky NBAC.jpg',
    objectPosition: 'top',
  },
  {
    name: 'Boyede Oyegbami',
    role: 'HEAD, SALES',
    image: '/images/Boyede NBAC.jpg',
    objectPosition: 'top',
  },
]

export const CONFERENCE_OBJECTIVES = [
  'Raise awareness of the growing business aviation industry in Nigeria and provide a forum for all stakeholders to exchange views.',
  'Explore and find customized Finance solutions on the continent as a further growth catalyst.',
  'First steps to adopting industry-enhancing regulations in line with growing Business Aviation policies.',
  'Establishing the Business of Executive aviation in Nigeria and Africa as a whole.',
]

export const TARGET_AUDIENCE = [
  "High Net-worth Individuals (HNI's) who charter, own or intend to purchase/lease private jets.",
  'Industry regulators (CAA, Airport Authorities, Customs, Immigration and Ministry of Aviation).',
  'Aircraft Manufacturers, Operators and Service Providers in the Business Aviation industry.',
  'National and international companies with business aviation interests.',
]

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Program', href: '/program' },
  { label: 'Speakers', href: '/speakers' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Contact', href: '/contact' },
]

export const SPONSOR_TIERS: SponsorTierDetails[] = [
  {
    id: 'title',
    name: 'Title Sponsor',
    price: 55000,
    currency: 'USD',
    availability: 'limited',
    badge: 'Exclusive Sponsor (1 Available)',
    slotsAvailable: 1,
    description: 'The conference co-owner. Your brand sits alongside NBAC 2027 in every context.',
    brandingPrivileges: [
      'Conference co-branding — presented as "NBAC 2027, presented by [Sponsor]" across all collateral',
      'Exclusive naming rights to the Gala Dinner — "The [Sponsor] Evening with the Aviator"',
      'Full takeover of the welcome area and registration zone — signage, floral and ambient design',
      'Full-bleed back cover of event programme + 500-word editorial feature',
      'Exclusive branded lanyards and delegate badges',
      'Branded delegate bags — logo on both sides'
    ],
    speakingPrivileges: [
      'Keynote address — 20 minutes on Day 1, prime post-opening position',
      'Named panel session — one of the 7 panels carries the sponsor\'s name as presenting partner',
      'Logo on all panel session slides and screens during the named session',
      'Right to distribute one piece of branded research or thought leadership to all delegates'
    ],
    digitalPrivileges: [
      'Homepage hero placement on NBAC 2027 website with hyperlink',
      'Prominent placement in all pre-event email communications',
      'Minimum 4 dedicated social media posts across NBAC channels pre-event',
      'Logo on all media photo call boards — mention in Chairman\'s remarks',
      '5 fully hosted delegate passes — both conference days and Gala Dinner',
      'Private pre-conference dinner with steering committee (up to 3 guests)',
      'First right of refusal on Title Sponsorship for NBAC 2028'
    ]
  },
  {
    id: 'platinum',
    name: 'Platinum Sponsor',
    price: 40000,
    currency: 'USD',
    availability: 'limited',
    badge: 'Premium Partner (2 Available)',
    slotsAvailable: 2,
    description: 'The premium conference partner. Highly visible, strongly positioned, with meaningful content access.',
    brandingPrivileges: [
      'Co-branding on selected conference materials — "In partnership with [Sponsor]"',
      'Exclusive naming rights to one conference day — Day 1 or Day 2',
      'Dedicated branded area within the networking and exhibition zone',
      'Inside front cover advertising in the event programme + full-page ad',
      'Branded networking coffee break on one conference day',
      'Logo on all event signage, roll-up banners and screens'
    ],
    speakingPrivileges: [
      '15-minute address at the conference — thought leadership or product presentation',
      'Right to co-host a 30-minute roundtable for up to 20 selected delegates',
      'Distribution of one branded item or publication in delegate bags'
    ],
    digitalPrivileges: [
      'Dedicated sponsor page on NBAC 2027 website',
      'Logo in all pre-event email communications as Platinum partner',
      '3 dedicated social media posts in the lead-up to the event',
      'Logo on media photo call boards — mention in Chairman\'s opening remarks',
      '4 fully hosted delegate passes — both conference days and Gala Dinner',
      'Invitation to speakers\' dinner the evening before the conference (2 guests)'
    ]
  },
  {
    id: 'gold',
    name: 'Gold Sponsor',
    price: 30000,
    currency: 'USD',
    availability: 'limited',
    badge: 'Elite Partner (3 Available)',
    slotsAvailable: 3,
    description: 'A strong, respected presence at the conference with genuine audience engagement opportunities.',
    brandingPrivileges: [
      'Named sponsor of the Networking Luncheon on one conference day',
      'Centrepiece table branding and menu cards bearing the sponsor\'s identity',
      'Logo on all event signage and roll-up banners',
      'Half-page advertisement in the event programme',
      'Branded item included in delegate bags (sponsor to supply)',
      'Logo on delegate bags'
    ],
    speakingPrivileges: [
      '10-minute address at the conference or moderated Q&A slot within a panel session of choice',
      'One branded question card per delegate table during the sponsor\'s chosen panel session'
    ],
    digitalPrivileges: [
      'Dedicated listing on NBAC 2027 sponsor page with hyperlink',
      'Logo included in all pre-event email communications',
      '2 dedicated social media posts in the lead-up to the event',
      'Logo on media photo call boards — acknowledgement in Chairman\'s welcome remarks',
      '3 fully hosted delegate passes — both conference days and Gala Dinner',
      'Invitation to speakers\' dinner the evening before the conference (1 guest)'
    ]
  },
  {
    id: 'silver',
    name: 'Silver Sponsor',
    price: 20000,
    currency: 'USD',
    availability: 'limited',
    badge: 'Associate Partner (5 Available)',
    slotsAvailable: 5,
    description: 'Visible, credible and commercially present — the right entry point for companies building their NBAC relationship.',
    brandingPrivileges: [
      'Named sponsor of the Speed Networking Session — Day 2',
      '5-minute brand introduction at the opening of the Speed Networking Session',
      'Logo on shared roll-up banners in high-visibility locations',
      'Quarter-page advertisement in the event programme',
      'Logo on delegate badges'
    ],
    speakingPrivileges: [
      'Right to include one piece of branded literature in delegate bags',
      'Logo on NBAC 2027 website sponsor section'
    ],
    digitalPrivileges: [
      'Logo included in pre-event email communications',
      '1 dedicated social media post in the lead-up to the event',
      'Logo on media photo call boards',
      '2 fully hosted delegate passes — both conference days and Gala Dinner',
      'Shared exhibition table presence during networking sessions'
    ]
  },
  {
    id: 'bronze',
    name: 'Bronze Sponsor',
    price: 10000,
    currency: 'USD',
    availability: 'available',
    badge: 'Member Partner (Open Tiers)',
    description: 'A credible entry point into the NBAC 2027 community — visibility, access and association with Nigeria\'s premier business aviation event.',
    brandingPrivileges: [
      'Logo on shared roll-up banners in visible conference locations',
      'Logo in the event programme',
      'Logo on the NBAC 2027 website sponsor section',
      'Logo on delegate badges'
    ],
    speakingPrivileges: [
      'Right to include one piece of branded literature in delegate bags',
      'Shared exhibition table presence during networking sessions'
    ],
    digitalPrivileges: [
      'Logo included in pre-event email communications',
      '1 social media mention in the lead-up to the event',
      'Logo on media photo call boards',
      '1 fully hosted delegate pass — both conference days and Gala Dinner'
    ]
  }
]

export const SPONSOR_ADD_ONS: SponsorAddOn[] = [
  {
    id: 'hackathon_title',
    name: 'Hackathon Title Sponsor',
    description: 'AeroLab NBAC 2027 — the conference hackathon — carries your name. Includes naming rights on the challenge, the trophy and all hackathon communications, plus a keynote moment at the award announcement.'
  },
  {
    id: 'hackathon_track',
    name: 'Hackathon Track Sponsor',
    description: 'One sponsor per challenge track. Your brand on all track materials and the right to a private meeting with the track winner and an introduction to their solution before the award ceremony.'
  },
  {
    id: 'delegate_bag_insert',
    name: 'Delegate Bag Insert',
    description: 'A single printed item — brochure, product card or promotional piece — placed inside every delegate bag distributed at registration. Reaches 100% of conference attendees.'
  },
  {
    id: 'digital_delegate_pack',
    name: 'Digital Delegate Pack',
    description: 'Branded content placed in the post-event email sent to all registered delegates after the conference. The last thing attendees read — and the most likely to be actioned when they return to their desks.'
  },
  {
    id: 'aerolab_prize_fund',
    name: 'AeroLab Prize Fund',
    isNegotiable: true,
    description: 'Underwrite the AeroLab cash prizes in exchange for prominent recognition at the Gala Dinner award ceremony — the single highest-visibility moment of the conference programme.'
  }
]

