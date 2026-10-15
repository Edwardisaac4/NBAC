import { CommitteeMember, SponsorTierDetails, PassTierDetails } from "@/types";

export interface SponsorAddOn {
  id: string;
  name: string;
  isNegotiable?: boolean;
  description: string;
}

export const STEERING_COMMITTEE_MEMBERS: CommitteeMember[] = [
  {
    name: "Segun Demuren",
    role: "CHAIRMAN",
    image: "/images/sd-nbac.jpg",
    objectPosition: "top",
    bio: `Olusegun Demuren brings visionary leadership and strategic expertise to EAN Aviation, driving its evolution as a leading force in Africa’s business aviation sector.

He holds a B.Sc. in Information Systems from Marist College, New York, and has completed executive programs at Lagos Business School and the International Air Transport Association (IATA) in Singapore.

His professional journey began as a Systems Analyst with renowned Wall Street firms Sanford C. Bernstein Inc. and Alliance Capital LLC, where he developed strong capabilities in investment strategy and systems integration.

Combining technological insight with a deep understanding of the aviation industry, he has positioned EAN Aviation at the forefront of innovation, service excellence, and operational precision, establishing it as a trusted name across the continent.`,
  },
  {
    name: "Josephine Kolawole",
    role: "",
    image: "/images/josephine-nbac.jpg",
    objectPosition: "top",
    bio: `Josephine Kolawole is a marketing leader with nearly a decade of experience driving brand growth across the technology and aviation sectors. As Head of Marketing at EAN Aviation, she leads brand strategy, integrated marketing communications, digital marketing, and public relations, delivering initiatives that strengthen brand visibility and support business growth.

Prior to this, she led regional marketing initiatives across Central Africa at HP, overseeing multi-market campaigns, go-to-market strategies, and channel marketing. Josephine is passionate about building brands that create measurable business impact through strategic thinking, stakeholder engagement, and data-driven execution. She is currently pursuing a PhD, reflecting her commitment to continuous learning and leadership.`,
  },
  {
    name: "Boyede Oyegbami",
    role: "",
    image: "/images/boyede-nbac.jpg",
    objectPosition: "top",
    bio: `Boyede Oyegbami is an accomplished aviation commercial leader with over a decade of experience driving business growth, customer acquisition, and operational excellence across leading energy and aviation fueling companies in Nigeria.

Prior to joining EAN, Boyede served as Aviation Commercial Manager at Eternal Plc, leading aviation business start-up, regulatory compliance, and end-to-end jet fuel operations, achieving milestones such as first into-plane fueling within a year and onboarding five airline customers in five months.

He holds an MSc in Environmental Consultancy from Newcastle University (UK) and a BSc in Microbiology from Bowen University, complemented by certifications from IATA, the British Safety Council, and IEMA. Skilled in contract negotiations, customer relationship management, and strategic sales growth.`,
  },
  {
    name: "OluBukunola Hudeyin",
    role: "",
    image: "/images/bukky-nbac.jpg",
    objectPosition: "top",
    bio: `Olubukunola Hundeyin is an accomplished Quality, Safety, and Compliance executive with nearly a decade of progressive leadership experience driving operational excellence, regulatory compliance, and continuous improvement within the aviation industry. As Head of Quality & Safety, she provides strategic leadership in quality assurance, safety management, compliance monitoring, and organizational performance, ensuring alignment with the Nigerian Civil Aviation Regulations (Nig. CARs), ICAO Standards and Recommended Practices (SARPs), and internationally recognized best practices.

She holds a Bachelor's degree in Chemical Engineering from the University of Lagos and a Postgraduate Diploma in Quality Management from Robert Gordon University, Aberdeen, Scotland. A full member of the Nigerian Society of Engineers (NSE), Olubukunola combines technical expertise with strategic leadership to deliver sustainable business improvements and strengthen organizational resilience.

Throughout her career, Olubukunola has led and contributed to high-impact quality, safety, and compliance initiatives across aviation operations. She has successfully driven the implementation and continual improvement of Quality Management Systems (QMS), strengthened compliance monitoring programmes, enhanced operational processes, and partnered with multidisciplinary teams to embed a culture of quality, safety, and accountability.

Among her notable achievements is leading the successful maintenance of the International Standard for Business Aircraft Handling (IS-BAH) Stage II Certification through two consecutive certification cycles, demonstrating her commitment to operational excellence and international best practices. She also leads the implementation and continual enhancement of ISO-based Quality Management Systems, supporting improved organizational performance, customer satisfaction, and regulatory compliance.

An American Society for Quality (ASQ) Certified Quality Auditor (CQA) and Certified Quality Improvement Associate (CQIA), Olubukunola also holds certifications in NEBOSH International General Certificate in Occupational Health and Safety, ISO 9001:2015 Lead Auditor, Quality Management Systems in Aviation, QMS Auditor/Lead Auditor, and Internal Auditing, reflecting her commitment to continuous professional development.

Recognized for her collaborative leadership, integrity, and results-driven approach, Olubukunola is passionate about building high-performing teams, fostering a proactive safety culture, and implementing management systems that deliver measurable value. She remains committed to advancing quality and safety standards, strengthening regulatory compliance, and helping organizations achieve operational excellence in an evolving global aviation industry.`,
  },
  {
    name: "Tunde Tunde-Awe",
    role: "",
    image: "/images/tunde-awe-nbac.jpg",
    objectPosition: "top",
    bio: `Tunde oversees a multi-programme portfolio at EAN Aviation Group spanning aviation infrastructure development, charter operations, digital transformation, and new business development. He is building the PMO’s maturity as a strategic function within EAN.

His strengths lie in critical thinking, stakeholder management, and problem-solving, aligning consultants, regulators, and internal teams toward shared outcomes. He brings hands-on execution to corporate goals, closing the gap between strategy and delivery.

Tunde holds a BSc in Geology and is PRINCE2 Practitioner certified, with executive education in Systems Thinking (MIT), Developing and Financing Infrastructure Projects (Brickstone Africa), and AI Infrastructure & Operations (NVIDIA). He is currently completing the Senior Management Programme at Lagos Business School.`,
  },
  {
    name: "Ann Umeh",
    role: "",
    image: "/images/ann-umeh-nbac.jpg",
    objectPosition: "top",
    bio: `Ann Umeh is a dedicated Customer Relations professional known for building meaningful client connections and enhancing service excellence.

She earned a bachelor’s degree in Computer Science from Lagos State University (LASU) and began her aviation career with a leading support service operator in Nigeria. Through her tenure as a Customer Relations Officer, Ann developed a robust foundation in client engagement and service management. She has since sharpened her skills with specialized training in project management, PLST, and leadership development.

At EAN Aviation, Ann combines technical knowledge with a people-first approach to deliver seamless customer experiences that uphold the brand’s elite standards of service and responsiveness.`,
  },
  {
    name: "Stephanie Leonard",
    role: "",
    image: "/images/stephanie-nbac.jpeg",
    objectPosition: "top",
    bio: `Stephanie Leonard plays a key role in campaign strategy, media relations, and brand activation for the Nigerian Business Aviation Conference. She brings expertise in digital storytelling, event marketing, and delegate engagement, contributing to NBAC's position as West Africa's leading business aviation platform.`,
  },
  {
    name: "Christine Emanuwa",
    role: "",
    image: "/images/christine-nbac.jpg",
    objectPosition: "top",
    bio: `Christine Emanuwa specializes in digital communications, sponsor integration, and creative media asset management for NBAC. She supports end-to-end marketing execution, delegate communications, and press engagement to maximize event reach and partner visibility.`,
  },
];

export const ABOUT_COMMITTEE_MEMBERS: CommitteeMember[] = STEERING_COMMITTEE_MEMBERS;

export const CONFERENCE_OBJECTIVES = [
  "Strengthen industry dialogue and collaboration between regulators, operators, financiers, OEMs, and service providers.",
  "Facilitate access to aviation financing and leasing solutions for acquisition, fleet modernisation, and infrastructure.",
  "Support progressive and enabling regulatory frameworks for safe, efficient, and globally competitive operations.",
  "Promote sustainable growth of the business aviation ecosystem across operations, maintenance, charter, FBOs, and support services.",
  "Encourage innovation and technology development in aviation, from AI and digital systems to advanced air mobility and e-VTOL.",
  "Demonstrate the value of business aviation for executive mobility, productivity, and economic productivity across Africa.",
];

export const TARGET_AUDIENCE = [
  "High Net-worth Individuals (HNI's) who charter, own or intend to purchase/lease private jets.",
  "Industry regulators (CAA, Airport Authorities, Customs, Immigration and Ministry of Aviation).",
  "Aircraft Manufacturers, Operators and Service Providers in the Business Aviation industry.",
  "National and international companies with business aviation interests.",
];

// Keep in sync with the NAV_LINKS list in components/layout/navbar.tsx
// (Program and AeroLab are commented out for now)
export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  // { label: "Program", href: "/program" },
  // { label: "AeroLab", href: "/aerolab" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

export const SOCIAL_LINKS = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/ean-aviation-limited/",
    icon: "Linkedin",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/eanaviationltd/",
    icon: "Instagram",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@eanaviation",
    icon: "TikTok",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/eanaviationltd/",
    icon: "Facebook",
  },
];

export const SPONSOR_TIERS: SponsorTierDetails[] = [
  {
    id: "platinum",
    name: "Platinum Sponsor",
    price: 25000,
    currency: "USD",
    availability: "limited",
    badge: "Premium Partner",
    description:
      "The premium conference partner. Highly visible, strongly positioned, with meaningful content access.",
    brandingPrivileges: [
      "Sponsor of Gala Dinner",
      "Branding visible at Gala Dinner",
      "Partnership branding: \"In partnership with...\"",
      "Visible branding in welcome area, registration zone, exhibition zone",
      "Sponsorship of one panel or speech",
      "Logo on delegate bags",
      "Branded items in delegate bags",
      "Logo on various conference materials",
    ],
    speakingPrivileges: [
      "Keynote address",
      "Panel speaking opportunity",
    ],
    digitalPrivileges: [
      "5 fully hosted passes (both days + Gala)",
      "Logo on NBAC website",
      "Named in all delegate communications",
      "Mentioned in media outreach",
      "6 social media posts",
      "First right of refusal for Platinum sponsorship at NBAC 2028",
    ],
  },
  {
    id: "gold",
    name: "Gold Sponsor",
    price: 20000,
    currency: "USD",
    availability: "limited",
    badge: "Elite Partner",
    description:
      "A strong, respected presence at the conference with genuine audience engagement opportunities.",
    brandingPrivileges: [
      "Sponsorship, with visible branding, of one luncheon, breakfast or coffee break",
      "Sponsor branding: \"In collaboration with...\"",
      "Visible branding in welcome area, registration zone, exhibition zone",
      "Sponsorship of one panel or speech",
      "Logo on delegate bags",
      "Branded items in delegate bags",
      "Logo on various conference materials",
    ],
    speakingPrivileges: [
      "Speaking opportunity",
    ],
    digitalPrivileges: [
      "4 fully hosted passes (both days + Gala)",
      "Logo on NBAC website",
      "Named in all delegate communications",
      "4 social media posts",
    ],
  },
  {
    id: "silver",
    name: "Silver Sponsor",
    price: 10000,
    currency: "USD",
    availability: "limited",
    badge: "Associate Partner",
    description:
      "Visible, credible and commercially present — the right entry point for companies building their NBAC relationship.",
    brandingPrivileges: [
      "Sponsorship of Speed Networking Session",
      "Sponsor branding: \"Sponsored by...\"",
      "Visible branding in welcome area, registration zone",
      "Logo on delegate bags",
      "Branded items in delegate bags",
      "Logo on various conference materials",
    ],
    speakingPrivileges: [
      "Speaking opportunity",
    ],
    digitalPrivileges: [
      "3 fully hosted passes (both days + Gala)",
      "Logo on NBAC website",
      "Named in all delegate communications",
      "3 social media posts",
    ],
  },
  {
    id: "bronze",
    name: "Bronze Sponsor",
    price: 5000,
    currency: "USD",
    availability: "available",
    badge: "Member Partner",
    description:
      "A credible entry point into the NBAC 2027 community — visibility, access and association with Nigeria's premier business aviation event.",
    brandingPrivileges: [
      "Sponsor branding: \"Sponsored by...\"",
      "Visible branding in registration zone",
      "Branded items in delegate bags",
      "Logo on various conference materials",
    ],
    speakingPrivileges: [],
    digitalPrivileges: [
      "2 fully hosted passes (both days + Gala)",
      "Logo on NBAC website",
      "Named in some delegate communications",
      "2 social media posts",
    ],
  },
];

export const SPONSOR_ADD_ONS: SponsorAddOn[] = [
  {
    id: "hackathon_title",
    name: "Hackathon Title Sponsor",
    description:
      "AeroLab NBAC 2027 — the conference hackathon — carries your name. Includes naming rights on the challenge, the trophy and all hackathon communications, plus a keynote moment at the award announcement.",
  },
  {
    id: "hackathon_track",
    name: "Hackathon Track Sponsor",
    description:
      "One sponsor per challenge track. Your brand on all track materials and the right to a private meeting with the track winner and an introduction to their solution before the award ceremony.",
  },
  {
    id: "delegate_bag_insert",
    name: "Delegate Bag Insert",
    description:
      "A single printed item — brochure, product card or promotional piece — placed inside every delegate bag distributed at registration. Reaches 100% of conference attendees.",
  },
  {
    id: "digital_delegate_pack",
    name: "Digital Delegate Pack",
    description:
      "Branded content placed in the post-event email sent to all registered delegates after the conference. The last thing attendees read — and the most likely to be actioned when they return to their desks.",
  },
  {
    id: "aerolab_prize_fund",
    name: "AeroLab Prize Fund",
    isNegotiable: true,
    description:
      "Underwrite the AeroLab cash prizes in exchange for prominent recognition at the Gala Dinner award ceremony — the single highest-visibility moment of the conference programme.",
  },
];

export const PASS_TIERS: PassTierDetails[] = [
  {
    id: "vip",
    name: "VIP Delegate Pass",
    badge: "Executive Delegate",
    price: 250,
    currency: "USD",
    availability: "available",
    billingModel: "per_delegate",
    includedDelegates: 1,
    privileges: [
      "Admission to all keynote speeches, panel debates, and workshops",
      "Daily networking gourmet lunch buffet & premium coffee lounges",
      "Access to the official NBAC Gala Dinner & awards ceremony",
      "Access to the exclusive evening networking cocktail reception",
      "Official NBAC delegate gift package and conference materials",
    ],
  },
];
