export interface GalleryItem {
  id: string
  src: string
  alt: string
  title: string
  description: string
  year: '2013' | '2014' | '2016' | '2017' | '2026'
  category: 'Conference' | 'Exhibition' | 'Gala Dinner' | 'Networking'
}

export const GALLERY_YEARS = ['All', '2026', '2017', '2016', '2014', '2013'] as const;
export const GALLERY_CATEGORIES = ['All', 'Conference', 'Exhibition', 'Gala Dinner', 'Networking'] as const;

export const HISTORICAL_GALLERY_ITEMS: GalleryItem[] = [
  // 2017
  {
    id: '2017-gala',
    src: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=1200&auto=format&fit=crop',
    alt: 'NBAC 2017 An Evening of Aviators Gala Dinner',
    title: 'An Evening of Aviators',
    description: 'The signature gala dinner celebrating the closing of the 2017 summit.',
    year: '2017',
    category: 'Gala Dinner',
  },
  {
    id: '2017-cabin',
    src: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?q=80&w=1200&auto=format&fit=crop',
    alt: 'NBAC 2017 Executive Jet Interior Showcase',
    title: 'Executive Jet Cabin Showcases',
    description: 'Touring state-of-the-art corporate cabins on the static display line.',
    year: '2017',
    category: 'Exhibition',
  },
  {
    id: '2017-keynote',
    src: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1200&auto=format&fit=crop',
    alt: 'NBAC 2017 Keynote Address on Aircraft Leasing',
    title: 'Modern Finance Keynote',
    description: 'Keynote presentation on tailored leasing and finance models for African business jets.',
    year: '2017',
    category: 'Conference',
  },

  // 2016
  {
    id: '2016-policy',
    src: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop',
    alt: 'NBAC 2016 Airspace Policy Forum',
    title: 'Advocating for Sky Openness',
    description: 'Advocacy sessions on tax incentives, customs, and airspace access rules.',
    year: '2016',
    category: 'Conference',
  },
  {
    id: '2016-exhibition',
    src: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1200&auto=format&fit=crop',
    alt: 'NBAC 2016 Aircraft Engine Standards Showcase',
    title: 'Business Aviation Standards',
    description: 'Emphasizing aircraft maintenance standards and safety certifications.',
    year: '2016',
    category: 'Exhibition',
  },
  {
    id: '2016-networking',
    src: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=1200&auto=format&fit=crop',
    alt: 'NBAC 2016 Operator Roundtable Networking',
    title: 'Industry Alliance Roundtables',
    description: 'Connecting international aircraft brokers with local charter operators.',
    year: '2016',
    category: 'Networking',
  },

  // 2014
  {
    id: '2014-tarmac',
    src: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1200&auto=format&fit=crop',
    alt: 'NBAC 2014 FBO Terminal Expansion',
    title: 'FBO Infrastructure Growth',
    description: 'Discussions surrounding FBO and hangar capacity expansions in West Africa.',
    year: '2014',
    category: 'Exhibition',
  },
  {
    id: '2014-panel',
    src: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=1200&auto=format&fit=crop',
    alt: 'NBAC 2014 Regulatory Panel Discussion',
    title: 'Regulatory Harmonization Panel',
    description: 'Regulators and operators aligning on West African business aviation frameworks.',
    year: '2014',
    category: 'Conference',
  },
  {
    id: '2014-banquet',
    src: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200&auto=format&fit=crop',
    alt: 'NBAC 2014 Networking Banquet Dinner',
    title: '2014 Networking Banquet',
    description: 'Delegates reflecting on conference takeaways during the evening banquet.',
    year: '2014',
    category: 'Gala Dinner',
  },

  // 2013
  {
    id: '2013-launch',
    src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop',
    alt: 'NBAC 2013 Inaugural Opening Ceremony',
    title: 'The Launch of NBAC 2013',
    description: 'The opening ceremony of the inaugural Nigerian Business Aviation Conference.',
    year: '2013',
    category: 'Conference',
  },
  {
    id: '2013-static',
    src: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=1200&auto=format&fit=crop',
    alt: 'NBAC 2013 Static Aircraft display on Runway',
    title: 'Inaugural Static Display',
    description: 'Business jets showcased on the tarmac at the inaugural summit.',
    year: '2013',
    category: 'Exhibition',
  },
  {
    id: '2013-networking',
    src: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1200&auto=format&fit=crop',
    alt: 'NBAC 2013 Stakeholder Coffee Break Networking',
    title: 'Laying the Groundwork',
    description: 'Aviation stakeholders building initial connections during the networking break.',
    year: '2013',
    category: 'Networking',
  },
];
