import { EventDetails, Speaker } from "@/types";

export const SPEAKERS: Record<string, Speaker> = {
  segun: {
    id: "segun",
    name: "Segun Demuren",
    title: "Chairman",
    company: "NBAC Steering Committee",
    avatar_url: "/images/SD ! NBAC.jpg",
    bio: "Segun Demuren is the Chairman of the NBAC Steering Committee. He is a prominent leader in African business aviation, with decades of experience driving transport logistics, investments, and aviation development across West Africa."
  },
  steve_varsano: {
    id: "steve_varsano",
    name: "Steve Varsano",
    title: "Founder",
    company: "The Jet Business",
    bio: "Steve Varsano is the founder of The Jet Business, the world's first street-level corporate aviation showroom. He is a globally renowned business jet broker and industry expert with over 40 years of experience in aircraft transactions and aviation infrastructure scaling."
  },
  captain_abdullahi: {
    id: "captain_abdullahi",
    name: "Capt. Abdullahi",
    title: "Regulatory Specialist",
    company: "Aviation Consulting",
    bio: "Captain Abdullahi is a veteran aviator and compliance specialist. He advises civil aviation authorities and operators on safety management systems, regulatory audit compliance, and path to ICAO Category 1 compliance."
  },
  chidinma: {
    id: "chidinma",
    name: "Chidinma Okafor",
    title: "Head of Regulatory Compliance",
    company: "Nigerian Civil Aviation Authority (NCAA)",
    avatar_url: "/images/Josephine NBAC.jpg",
    bio: "Ms. Chidinma Okafor is an aviation law expert specializing in regulatory compliance, safety oversight audit processes, and airspace management policies. She has represented Nigeria in numerous international aviation safety summits."
  },
  fatima: {
    id: "fatima",
    name: "Capt. Fatima Ali",
    title: "Director of Flight Operations",
    company: "Zenith Jet Services",
    avatar_url: "/images/Christine NBAC.jpg",
    bio: "Capt. Fatima Ali is a pioneer in corporate aviation piloting with over 8,000 flight hours command experience on Gulfstream and Bombardier aircraft. She oversees Zenith Jet's flight crew operations, route safety, and fleet management."
  },
  ibrahim: {
    id: "ibrahim",
    name: "Capt. Ibrahim Nuru",
    title: "Chief Pilot",
    company: "Air Nigeria Charter",
    avatar_url: "/images/Tunde Awe NBAC.jpg",
    bio: "Capt. Ibrahim Nuru commands charter operations across the Middle East and African corridors. A crew resource management specialist, he advises operators on procedural safety, ground compliance, and private terminal logistics."
  },
  samuel: {
    id: "samuel",
    name: "Samuel Akenzua",
    title: "Managing Director",
    company: "West Africa Charter Group",
    avatar_url: "/images/Boyede NBAC.jpg",
    bio: "Samuel Akenzua is a logistics and aviation management executive. He has directed several high-profile charter projects for multinational corporations and diplomatic missions, optimizing flight paths and passenger logistics."
  },
  adebayo: {
    id: "adebayo",
    name: "Dr. Adebayo Ojo",
    title: "Senior Aviation Economist & Advisor",
    company: "Lagos Business School",
    avatar_url: "/images/Seye NBAC.jpeg",
    bio: "Dr. Adebayo Ojo conducts policy research on transport economics and infrastructure financing. He consults widely for governments and private consortia seeking to establish airport networks and dry ports."
  },
  amina: {
    id: "amina",
    name: "Dr. Amina Olaye",
    title: "Executive Director",
    company: "AeroGreen Technologies",
    avatar_url: "/images/Stephanie NBAC.jpeg",
    bio: "Dr. Amina Olaye is an aerospace engineer and environmental advocate. He leads research into sustainable aviation fuels (SAF), hybrid propulsion systems, and green initiatives designed for rapid adoption in emerging markets."
  },
  erica: {
    id: "erica",
    name: "Erica",
    title: "Aviation Finance Lead",
    company: "TLG Capital",
    avatar_url: "/images/Ann umeh NBAC.jpg",
    bio: "Erica is a leading finance specialist specializing in real-world aircraft leasing, structure financing, and aviation asset management in emerging markets."
  },
  minister_aviation: {
    id: "minister_aviation",
    name: "Minister of Aviation",
    title: "Honorable Minister",
    company: "Federal Ministry of Aviation",
    bio: "The Honorable Minister of Aviation oversees civil aviation regulations, safety standards, infrastructure upgrades, and strategic international partnerships across Nigeria's airspace."
  },
  host: {
    id: "host",
    name: "Conference Host",
    title: "Master of Ceremonies",
    company: "NBAC Team",
    bio: "The official host for the Nigerian Business Aviation Conference, facilitating transitions, networking exercises, and interactive roundtable discussions."
  }
};

export const MOCK_EVENTS: EventDetails[] = [
  {
    id: "nbac-2027-day-1",
    title: "NBAC 2027 Conference — Day 1",
    subtitle: "West Africa's Premier Aviation Assembly",
    date: "May 4, 2027",
    location: " Mariot Hotel, Ikeja, Lagos",
    description: "Day 1 of the flagship summit focusing on industry dialogue, regulatory frameworks, infrastructure ops, and financial structures in African aviation.",
    image_url: "/images/private_jet_runway_dusk.png",
    status: "featured",
    sessions: [
      {
        id: "d1-s1",
        day: "day_1",
        start_time: "08:00",
        end_time: "10:00",
        category: "networking",
        title: "Registration and Refreshments",
        abstract: "Delegate registration, badge collection, and morning refreshments. Network with business leaders and aviation delegates.",
        speakers: [],
        location: "Grand Ballroom Foyer"
      },
      {
        id: "d1-s2",
        day: "day_1",
        start_time: "10:00",
        end_time: "10:30",
        category: "keynote",
        title: "Opening Remarks & Welcome Address",
        abstract: "Official opening of the Nigerian Business Aviation Conference and welcome address from event directors.",
        speakers: [],
        location: "Main Auditorium"
      },
      {
        id: "d1-s3",
        day: "day_1",
        start_time: "10:30",
        end_time: "10:45",
        category: "keynote",
        title: "Keynote Speech",
        abstract: "Opening keynote address by the Conference Chairman, outlining the current state and future vision of West African aviation.",
        speakers: [SPEAKERS.segun],
        location: "Main Auditorium"
      },
      {
        id: "d1-s4",
        day: "day_1",
        start_time: "10:45",
        end_time: "10:55",
        category: "keynote",
        title: "Guest of Honor / Sponsor's Slot 1",
        abstract: "Special sponsor address presented by the OEM and Federal Minister of Aviation.",
        speakers: [SPEAKERS.minister_aviation],
        location: "Main Auditorium"
      },
      {
        id: "d1-s5",
        day: "day_1",
        start_time: "10:55",
        end_time: "11:00",
        category: "keynote",
        title: "Guest of Honor / Sponsor's Slot 2",
        abstract: "Brief introductory remarks setting the stage for the first panel block before the break, Minister next, and operators panel before regulatory panel.",
        speakers: [],
        location: "Main Auditorium"
      },
      {
        id: "d1-s6",
        day: "day_1",
        start_time: "11:00",
        end_time: "11:30",
        category: "networking",
        title: "Networking Break / Ice Breaker",
        abstract: "Interact with other tables. Activity: After the break, someone from each table should be able to name three people on their table and at least one person on another table.",
        speakers: [SPEAKERS.host],
        location: "Exhibition Hall"
      },
      {
        id: "d1-s7",
        day: "day_1",
        start_time: "11:30",
        end_time: "12:30",
        category: "panel",
        title: "One Sky, Many Voices: Industry Dialogue & Collaboration (Advert Slot)",
        abstract: "Key Discussion Points: Regulators, operators, OEMs and financiers in conversation • Unresolved friction across the value chain • Building a unified industry advocacy voice • Regulators, Operators and Service providers (fuel, inflight catering, ground handling).",
        speakers: [SPEAKERS.samuel, SPEAKERS.ibrahim],
        location: "Main Auditorium"
      },
      {
        id: "d1-s8",
        day: "day_1",
        start_time: "12:30",
        end_time: "13:30",
        category: "panel",
        title: "Rules that Fly (Roundtable)",
        abstract: "Key Discussion Points: Operators present top 5 regulatory pain points • NCAA responds with timelines and commitments • Bilateral permit and overflight clearance reform • Path to ICAO Category 1 compliance.",
        speakers: [SPEAKERS.chidinma, SPEAKERS.captain_abdullahi],
        location: "Main Auditorium"
      },
      {
        id: "d1-s9",
        day: "day_1",
        start_time: "13:30",
        end_time: "14:30",
        category: "keynote",
        title: "The Boardroom at 40,000 ft: Ecosystem Growth — Infrastructure and Ops (Advert Slot)",
        abstract: "Insights into corporate aircraft transactions, global infrastructure growth, and operations.",
        speakers: [SPEAKERS.steve_varsano],
        location: "Main Auditorium"
      },
      {
        id: "d1-s10",
        day: "day_1",
        start_time: "14:30",
        end_time: "15:00",
        category: "break",
        title: "Lunch & Networking",
        abstract: "Gourmet networking lunch with delegates, sponsors, and steering committee members.",
        speakers: [],
        location: "Dining Suite"
      },
      {
        id: "d1-s11",
        day: "day_1",
        start_time: "15:00",
        end_time: "16:00",
        category: "panel",
        title: "Deals That Got Done: Real-World Finance Structures in African Aviation",
        abstract: "Key Discussion Points: Live case studies from Nigerian and African operators • Lessons from failed and successful deals • What lenders want from African borrowers • Building a bankable aviation business plan.",
        speakers: [SPEAKERS.erica, SPEAKERS.adebayo],
        location: "Main Auditorium"
      },
      {
        id: "d1-s12",
        day: "day_1",
        start_time: "16:00",
        end_time: "17:00",
        category: "workshop",
        title: "AeroLab Pitch",
        abstract: "10 finalists to pitch their ideas to the delegates and judges. After judges ask clarifying questions, the most voted question by the audience gets asked to each finalist — just one.",
        speakers: [],
        location: "AeroLab Arena"
      },
      {
        id: "d1-s13",
        day: "day_1",
        start_time: "17:00",
        end_time: "17:30",
        category: "networking",
        title: "Audience Speak & Final Recap",
        abstract: "Open mic session for the audience to ask questions (mics passed from table to table, questions displayed live), followed by a brief summary of Day 1.",
        speakers: [],
        location: "Main Auditorium"
      },
      {
        id: "d1-s14",
        day: "day_1",
        start_time: "19:30",
        end_time: "22:00",
        category: "networking",
        title: "NBAC Gala Dinner",
        abstract: "Official black-tie dinner, awards ceremony, and premium live entertainment.",
        speakers: [SPEAKERS.segun],
        location: "Grand Ballroom"
      }
    ]
  },
  {
    id: "nbac-2027-day-2",
    title: "NBAC 2027 Conference — Day 2",
    subtitle: "Innovation, Sustainability & Leadership",
    date: "May 5, 2027",
    location: "Grand Ballroom, Mariot Hotel, Ikeja, Lagos",
    description: "Day 2 of the flagship summit focusing on ecosystem scale, sustainability, women leadership in aviation, innovation & tech, and speed networking.",
    image_url: "/images/interior_cabin.jpg",
    status: "featured",
    sessions: [
      {
        id: "d2-s1",
        day: "day_2",
        start_time: "09:00",
        end_time: "09:30",
        category: "keynote",
        title: "Welcome, Recap & Sponsor's Slot",
        abstract: "Recap of Day 1 takeaways, regulatory updates, and brief sponsor presentation.",
        speakers: [],
        location: "Main Auditorium"
      },
      {
        id: "d2-s2",
        day: "day_2",
        start_time: "09:30",
        end_time: "10:30",
        category: "panel",
        title: "From Niche to Necessary: How Business Aviation Ecosystems Scale",
        abstract: "Key Discussion Points: Benchmarking Nigeria against South Africa and Morocco • Which value chain segment has the most untapped potential? • The role of the FBO in growing the charter market • Building a sustainable Nigerian MRO capability.",
        speakers: [SPEAKERS.adebayo],
        location: "Main Auditorium"
      },
      {
        id: "d2-s3",
        day: "day_2",
        start_time: "10:30",
        end_time: "11:30",
        category: "panel",
        title: "Sustainability: How Business Aviation Ecosystems Scale",
        abstract: "Key Discussion Points: Supply feeds-stock, environmental compliance, and eco-friendly technology implementation.",
        speakers: [SPEAKERS.fatima, SPEAKERS.amina],
        location: "Main Auditorium"
      },
      {
        id: "d2-s4",
        day: "day_2",
        start_time: "11:30",
        end_time: "11:40",
        category: "keynote",
        title: "Sponsor's Slot",
        abstract: "Short presentation by headline sponsor on private jet logistics and aviation solutions.",
        speakers: [],
        location: "Main Auditorium"
      },
      {
        id: "d2-s5",
        day: "day_2",
        start_time: "11:40",
        end_time: "12:40",
        category: "panel",
        title: "She Commands the Sky: Women Leading the Future of African Aviation",
        abstract: "Key Discussion Points: Reframing women in aviation as a business and talent imperative, not a diversity exercise • What it takes to build and sustain a career as a woman in African business aviation • Honest examination of the structural barriers holding women back • Identifying who is responsible for removing those barriers — and how.",
        speakers: [SPEAKERS.chidinma, SPEAKERS.fatima, SPEAKERS.amina],
        location: "Main Auditorium"
      },
      {
        id: "d2-s6",
        day: "day_2",
        start_time: "12:40",
        end_time: "13:10",
        category: "networking",
        title: "Morning Networking Break",
        abstract: "Sponsor exhibition space open, delegate networking, and cockpit walkthroughs.",
        speakers: [],
        location: "Exhibition Hall"
      },
      {
        id: "d2-s7",
        day: "day_2",
        start_time: "13:10",
        end_time: "14:10",
        category: "panel",
        title: "Flying Into the Future: Innovation & Technology in Aviation",
        abstract: "Key Discussion Points: AI applications in flight ops and safety • eVTOL and AAM readiness for African cities • Digital platforms for charter and dispatch • Aviation technology hackathon showcase.",
        speakers: [SPEAKERS.captain_abdullahi, SPEAKERS.ibrahim],
        location: "Main Auditorium"
      },
      {
        id: "d2-s8",
        day: "day_2",
        start_time: "14:10",
        end_time: "15:10",
        category: "workshop",
        title: "AeroLab Winners & People's Choice Award",
        abstract: "The judges would have selected their top 3 and they would get announced, those ranked 4th – 6th would then compete for the People's Choice Awards. Prize presented by Minister / OEM sponsor / Event hosts.",
        speakers: [SPEAKERS.segun, SPEAKERS.minister_aviation],
        location: "Main Auditorium"
      },
      {
        id: "d2-s9",
        day: "day_2",
        start_time: "15:10",
        end_time: "15:30",
        category: "keynote",
        title: "Sponsor's Slot & Final Recap",
        abstract: "Final sponsor highlights and closing program wrap-up from steering committee directors.",
        speakers: [],
        location: "Main Auditorium"
      },
      {
        id: "d2-s10",
        day: "day_2",
        start_time: "15:30",
        end_time: "17:00",
        category: "networking",
        title: "Speed Networking — Meet the Operators & Closing Remarks",
        abstract: "Key Discussion Points: Delegates matched with FBO, charter, MRO, OEM and finance representatives • Open deal-making floor • Closing Remarks & Farewell Cocktail (Conference resolution • NBAC 2028 announcement • Delegates' farewell reception).",
        speakers: [SPEAKERS.host],
        location: "Sky Lounge & Poolside"
      }
    ]
  },
  {
    id: "gala-dinner",
    title: "Executive VIP Gala & Dinner",
    subtitle: "An Exclusive Evening of High-End Connections",
    date: "May 4, 2027",
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
        speakers: [SPEAKERS.segun, SPEAKERS.samuel],
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
  }
];