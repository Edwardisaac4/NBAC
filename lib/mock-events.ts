import { EventDetails, Speaker } from "@/types";

export const SPEAKERS: Record<string, Speaker> = {
  yande: {
    id: "yande",
    name: "Yande Bakare",
    title: "Chairperson",
    company: "Nigerian Aviation Association",
    avatar_url: "/images/yande_bakare.png",
    bio: "Yande Bakare has over 25 years of leadership experience across aviation operations, regulatory policy, and industry advocacy in West Africa. As Chairperson of the NAA, she champions infrastructure development, international partnerships, and commercial growth strategies."
  },
  chidinma: {
    id: "chidinma",
    name: "Chidinma Okafor",
    title: "Head of Regulatory Compliance",
    company: "Nigerian Civil Aviation Authority (NCAA)",
    avatar_url: "/images/ms_chidinma_okafor.png",
    bio: "Ms. Chidinma Okafor is an aviation law expert specializing in regulatory compliance, safety oversight audit processes, and airspace management policies. She has represented Nigeria in numerous international aviation safety summits."
  },
  fatima: {
    id: "fatima",
    name: "Capt. Fatima Ali",
    title: "Director of Flight Operations",
    company: "Zenith Jet Services",
    avatar_url: "/images/captain_fatima_ali.png",
    bio: "Capt. Fatima Ali is a pioneer in corporate aviation piloting with over 8,000 flight hours command experience on Gulfstream and Bombardier aircraft. She oversees Zenith Jet's flight crew operations, route safety, and fleet management."
  },
  ibrahim: {
    id: "ibrahim",
    name: "Capt. Ibrahim Nuru",
    title: "Chief Pilot",
    company: "Air Nigeria Charter",
    avatar_url: "/images/capt_ibrahim_nuru.png",
    bio: "Capt. Ibrahim Nuru commands charter operations across the Middle East and African corridors. A crew resource management specialist, he advises operators on procedural safety, ground compliance, and private terminal logistics."
  },
  samuel: {
    id: "samuel",
    name: "Samuel Akenzua",
    title: "Managing Director",
    company: "West Africa Charter Group",
    avatar_url: "/images/samuel_akenzua.png",
    bio: "Samuel Akenzua is a logistics and aviation management executive. He has directed several high-profile charter projects for multinational corporations and diplomatic missions, optimizing flight paths and passenger logistics."
  },
  kenji: {
    id: "kenji",
    name: "Kenji Tanaka",
    title: "Global Aviation Strategist",
    company: "Skyline Consulting",
    avatar_url: "/images/mr_kenji_tanaka.png",
    bio: "Kenji Tanaka is an international aviation consultant based in London and Tokyo. He specializes in market entry strategies, corporate fleet acquisition portfolios, and FBO (Fixed-Base Operator) terminal efficiency optimizations."
  },
  adebayo: {
    id: "adebayo",
    name: "Dr. Adebayo Ojo",
    title: "Senior Aviation Economist & Advisor",
    company: "Lagos Business School",
    avatar_url: "/images/dr_adebayo_ojo.png",
    bio: "Dr. Adebayo Ojo conducts policy research on transport economics and infrastructure financing. He consults widely for governments and private consortia seeking to establish airport networks and dry ports."
  },
  amina: {
    id: "amina",
    name: "Dr. Amina Olaye",
    title: "Executive Director",
    company: "AeroGreen Technologies",
    avatar_url: "/images/dr_amina_olaye.png",
    bio: "Dr. Amina Olaye is an aerospace engineer and environmental advocate. She leads research into sustainable aviation fuels (SAF), hybrid propulsion systems, and green initiatives designed for rapid adoption in emerging markets."
  }
};

export const MOCK_EVENTS: EventDetails[] = [
  {
    id: "nbac-2026",
    title: "NBAC 2026 Annual Conference",
    subtitle: "West Africa's Premier Aviation Assembly",
    date: "October 28 - 29, 2026",
    location: "Grand Ballroom, Eko Hotels & Suites, Lagos",
    description: "The flagship summit bringing together regulators, operators, finance providers, and high-net-worth individuals to discuss West African airspace integration and FBO infrastructure growth.",
    image_url: "/images/private_jet_runway_dusk.png",
    status: "featured",
    sessions: [
      {
        id: "d1-s1",
        day: "day_1",
        start_time: "08:30",
        end_time: "09:30",
        category: "networking",
        title: "Registration & Morning Networking Breakfast",
        abstract: "Collect delegate passes, explore the exhibition floor, and enjoy breakfast with business leaders, aircraft manufacturers, and operators.",
        speakers: [],
        location: "Grand Ballroom Foyer"
      },
      {
        id: "d1-s2",
        day: "day_1",
        start_time: "09:30",
        end_time: "10:15",
        category: "keynote",
        title: "Opening Keynote: The Future of Business Aviation in West Africa",
        abstract: "An analytical outlook on the growth drivers, regulatory advancements, and structural shifts defining the private flight and logistics sectors across West Africa over the next decade.",
        speakers: [SPEAKERS.yande],
        location: "Main Auditorium (Hall A)"
      },
      {
        id: "d1-s3",
        day: "day_1",
        start_time: "10:30",
        end_time: "11:45",
        category: "panel",
        title: "Regulatory Integration: Overcoming Obstacles to Airspace Access",
        abstract: "Panelists address how regulators and private operators can collaborate to streamline flight permissions, safety compliance standardizations, and cross-border flight corridors in ECOWAS.",
        speakers: [SPEAKERS.chidinma, SPEAKERS.fatima],
        location: "Main Auditorium (Hall A)"
      },
      {
        id: "d1-s4",
        day: "day_1",
        start_time: "12:00",
        end_time: "13:00",
        category: "break",
        title: "VIP Lunch & Exhibition Gallery Showcase",
        abstract: "Experience the latest products, aircraft mockups, and technologies from global aviation exhibitors in the main exhibition hall.",
        speakers: [],
        location: "Exhibition Hall"
      },
      {
        id: "d1-s5",
        day: "day_1",
        start_time: "13:00",
        end_time: "14:15",
        category: "workshop",
        title: "Charter Optimization and Dispatch Operations Workshop",
        abstract: "A deep dive into advanced flight coordination, scheduling platforms, crew roster management, and cost-control strategies for private charter operations.",
        speakers: [SPEAKERS.samuel, SPEAKERS.ibrahim],
        location: "Conference Room B"
      },
      {
        id: "d1-s6",
        day: "day_1",
        start_time: "14:30",
        end_time: "16:00",
        category: "panel",
        title: "Infrastructure Scaling: Designing Next-Generation FBO Terminals",
        abstract: "Analyzing the business models, investment pathways, and operational standards required to design, finance, and operate premium Fixed-Base Operator terminals in sub-Saharan Africa.",
        speakers: [SPEAKERS.kenji, SPEAKERS.adebayo],
        location: "Main Auditorium (Hall A)"
      },
      {
        id: "d1-s7",
        day: "day_1",
        start_time: "16:00",
        end_time: "17:30",
        category: "networking",
        title: "Welcome Cocktail Reception",
        abstract: "Unwind after Day 1 with signature cocktails, light bites, and high-level networking with colleagues, sponsors, and speakers in a relaxed atmosphere.",
        speakers: [],
        location: "Poolside Terrace"
      },
      {
        id: "d2-s1",
        day: "day_2",
        start_time: "09:00",
        end_time: "10:00",
        category: "keynote",
        title: "Day 2 Keynote: Sustainable Aviation and Carbon Strategies in Africa",
        abstract: "Investigating the challenges and opportunities of implementing sustainable aviation fuels (SAF), fuel-efficiency updates, and offsets in fast-growing developing aviation markets.",
        speakers: [SPEAKERS.amina],
        location: "Main Auditorium (Hall A)"
      },
      {
        id: "d2-s2",
        day: "day_2",
        start_time: "10:15",
        end_time: "11:30",
        category: "panel",
        title: "Aircraft Financing & Asset Leasing Structures",
        abstract: "Financial experts break down dry and wet leasing structures, debt financing options, offshore registry strategies, and risk mitigation methodologies for aircraft acquisition.",
        speakers: [SPEAKERS.adebayo, SPEAKERS.kenji],
        location: "Main Auditorium (Hall A)"
      },
      {
        id: "d2-s3",
        day: "day_2",
        start_time: "11:45",
        end_time: "13:00",
        category: "workshop",
        title: "Safety Management Systems (SMS) Masterclass",
        abstract: "Practical guidance on establishing a safety-first operational culture, performing hazard analyses, implementing incident reporting portals, and aligning with ICAO Annex 19 guidelines.",
        speakers: [SPEAKERS.fatima, SPEAKERS.chidinma],
        location: "Conference Room B"
      },
      {
        id: "d2-s4",
        day: "day_2",
        start_time: "13:00",
        end_time: "14:00",
        category: "break",
        title: "Networking Luncheon",
        abstract: "Connect with exhibitors and delegates for a buffet lunch and brief product presentations in the dining suite.",
        speakers: [],
        location: "Dining Suite"
      },
      {
        id: "d2-s5",
        day: "day_2",
        start_time: "14:00",
        end_time: "15:30",
        category: "panel",
        title: "Crew Management, Safety Culture & Resource Optimization",
        abstract: "A panel debating strategies to address crew recruitment, licensing standards, fatigue management, and pilot retention trends affecting charter operations.",
        speakers: [SPEAKERS.ibrahim, SPEAKERS.samuel],
        location: "Main Auditorium (Hall A)"
      },
      {
        id: "d2-s6",
        day: "day_2",
        start_time: "15:30",
        end_time: "16:30",
        category: "keynote",
        title: "Closing Plenary: Establishing West Africa as a Global Aviation Hub",
        abstract: "A summary of the conference findings and an action-oriented manifesto for integrating regional air corridors, creating tax-incentivized zones, and standardizing operations.",
        speakers: [SPEAKERS.yande, SPEAKERS.amina],
        location: "Main Auditorium (Hall A)"
      },
      {
        id: "d2-s7",
        day: "day_2",
        start_time: "16:30",
        end_time: "18:00",
        category: "networking",
        title: "Closing Gala & Executive Networking Lounge",
        abstract: "Conclude the conference with a premium networking reception, media photo-ops, and farewell cocktails in the sky bar.",
        speakers: [],
        location: "Sky Lounge"
      }
    ]
  },
  {
    id: "gala-dinner",
    title: "Executive VIP Gala & Dinner",
    subtitle: "An Exclusive Evening of High-End Connections",
    date: "October 28, 2026",
    location: "Sky Lounge & Terrace, Lagos",
    description: "An ultra-premium evening under the stars for HNWIs, sponsors, and operators. Features fine dining, curated music, and high-level dealmaking in a relaxed atmosphere.",
    image_url: "/images/interior_cabin.jpg",
    status: "upcoming",
    sessions: [
      {
        id: "gd-s1",
        day: "day_1",
        start_time: "18:30",
        end_time: "19:30",
        category: "networking",
        title: "Red Carpet Arrival & Welcome Champagne Reception",
        abstract: "Receive a VIP welcome, walk the red carpet, and enjoy fine champagne and appetizers as delegates gather for an exclusive evening.",
        speakers: [],
        location: "Sky Terrace"
      },
      {
        id: "gd-s2",
        day: "day_1",
        start_time: "19:30",
        end_time: "20:00",
        category: "keynote",
        title: "Opening Toast & Welcome Remarks",
        abstract: "Executive welcome remarks on the power of collaboration and strategic relationships in driving private flight solutions in the region.",
        speakers: [SPEAKERS.yande, SPEAKERS.samuel],
        location: "Main Dining Suite"
      },
      {
        id: "gd-s3",
        day: "day_1",
        start_time: "20:00",
        end_time: "21:30",
        category: "break",
        title: "Three-Course Executive Gala Dinner & Live Jazz Performance",
        abstract: "Indulge in a carefully curated three-course dinner presenting local and global gastronomy, accompanied by live performances from standard West African jazz artists.",
        speakers: [],
        location: "Main Dining Suite"
      },
      {
        id: "gd-s4",
        day: "day_1",
        start_time: "21:30",
        end_time: "23:00",
        category: "networking",
        title: "Executive Networking & Nightcap Lounge",
        abstract: "Cap off the night with digestifs, hand-rolled cigars, and quiet discussions in the sky terrace lounge for private project development and partnerships.",
        speakers: [],
        location: "Sky Lounge"
      }
    ]
  },
  {
    id: "pre-summit",
    title: "Aviation Safety & Regulatory Pre-Summit",
    subtitle: "Focused Summit on Regulatory Standardizations",
    date: "October 27, 2026",
    location: "Conference Room B, Eko Hotels & Suites, Lagos",
    description: "A focused, half-day masterclass workshop on regulatory compliance audits, safety management systems (SMS), and local licensing policies for flight crews.",
    image_url: "/images/about_us_aviation.png",
    status: "upcoming",
    sessions: [
      {
        id: "ps-s1",
        day: "day_1",
        start_time: "09:00",
        end_time: "09:30",
        category: "break",
        title: "Morning Briefing & Coffee",
        abstract: "Register and network with fellow safety inspectors, compliance auditors, and flight crew dispatch teams over morning coffee.",
        speakers: [],
        location: "Conference Room B Foyer"
      },
      {
        id: "ps-s2",
        day: "day_1",
        start_time: "09:30",
        end_time: "11:00",
        category: "panel",
        title: "NCAA Compliance & International Safety Audits",
        abstract: "A detailed breakdown of compliance checklists, oversight audits, and methods for alignining local private operations with ICAO and NCAA standards.",
        speakers: [SPEAKERS.chidinma, SPEAKERS.fatima],
        location: "Conference Room B"
      },
      {
        id: "ps-s3",
        day: "day_1",
        start_time: "11:15",
        end_time: "13:00",
        category: "workshop",
        title: "Hazard Analysis & Risk Management in Corporate Aviation",
        abstract: "An interactive session mapping risk matrices, safety monitoring loops, incident reporting methodologies, and crew feedback integration in active operations.",
        speakers: [SPEAKERS.fatima, SPEAKERS.ibrahim],
        location: "Conference Room B"
      }
    ]
  }
];
