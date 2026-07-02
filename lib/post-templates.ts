export interface PostTemplate {
  id: string;
  name: string;
  description: string;
  title: string;
  type: 'Announcement' | 'Press Release' | 'Sponsor Update' | 'Event Copy';
  body: string;
}

export const POST_TEMPLATES: PostTemplate[] = [
  {
    id: 'tpl_minister_keynote',
    name: 'Ministerial Keynote Confirmation',
    description: 'Use for announcing confirmed addresses by government officials or regulators.',
    title: 'CONFIRMED: Honorable Minister of Aviation to Deliver Keynote Address at NBAC 2026',
    type: 'Announcement',
    body: `# Opening Keynote Confirmation

We are honored to officially announce that the **Honorable Minister of Aviation and Aerospace Development** will deliver the opening keynote address at the upcoming Nigerian Business Aviation Conference (NBAC) 2026.

## Session Details
* **Topic:** Navigating the Next Decade: Infrastructure, Regulation, and Growth in West African Aviation
* **Date:** Day 1 — November 12, 2026
* **Time:** 10:00 AM WAT
* **Location:** Main Ballroom, Eko Hotel Convention Centre

> "Business aviation is a critical driver of foreign direct investment and macroeconomic growth. Our regulatory framework is evolving to support modern fleet operations safely and efficiently." 
> — *Ministry Spokesperson*

### What to Expect from the Keynote:
* Updates on key airport infrastructure developments and private terminal operations.
* Regulatory reforms aimed at easing private aircraft importing and leasing in Nigeria.
* Strategic partnerships between the Federal Government and global operators.

Do not miss this opportunity to hear directly from regulatory headers. Secure your passes today.
`
  },
  {
    id: 'tpl_registration_open',
    name: 'Press Release: Registration Launch',
    description: 'Official press release template for the opening of delegate registrations.',
    title: 'PRESS RELEASE: Delegate Registration Officially Opens for West Africa\'s Premier Business Aviation Event',
    type: 'Press Release',
    body: `# FOR IMMEDIATE RELEASE

**LAGOS, NIGERIA** — The Organizing Committee of the Nigerian Business Aviation Conference (NBAC) is pleased to announce that delegate registration is officially open for the 2026 edition.

## Event Details
* **Dates:** November 12 - 14, 2026
* **Venue:** Lagos, Nigeria
* **Theme:** *Elevating Connectivity: Building Sustainable Aviation Partnerships in Africa*

This year's conference brings together aircraft operators, regulators, financial institutions, and high-net-worth individuals to discuss West Africa's growing corporate aviation sector.

### Registration Tiers
1. **VIP Executive Pass:** Unrestricted access, private roundtables, VIP lounge access, and invitation to the Gala Dinner.
2. **Exhibitor Pass:** Premium booth space in the Main Hall, branding opportunities, and 2 delegate passes.
3. **Static Tarmac Pass:** Tarmac access for aircraft viewing, flight crew briefing access, and networking area.

Interested delegates can secure their executive passes directly on the official NBAC platform. Payments are processed securely via Paystack.

---
**Media Contact:**  
NBAC Communications Team  
*Email:* media@nbac.ng  
*Phone:* +234 (0) 1 234 5678
`
  },
  {
    id: 'tpl_vip_experience',
    name: 'VIP Executive Pass Spotlight',
    description: 'Promotional content highlighting the privileges of the VIP pass tier.',
    title: 'The VIP Executive Experience: Networking at the Highest Level',
    type: 'Event Copy',
    body: `# Elevate Your Network: The VIP Experience

At NBAC 2026, we don't just host panel sessions—we curate high-value connections. The **VIP Executive Pass** is designed specifically for decision-makers who require an elite environment for deal-making and strategic discussions.

## VIP Pass Privileges Include:

### 1. The Closed-Door Roundtable
Gain exclusive access to private, Chatham House Rule sessions with directors of civil aviation authorities and international FBO operators.

### 2. The Presidential VIP Lounge
Enjoy premium dining, high-speed Wi-Fi, and private meeting pods within the Eko Convention Centre, away from the main exhibition bustle.

### 3. Gala Dinner & Networking Cocktail
Receive a complimentary invitation to our signature networking events, hosted at a private waterfront venue on Day 2.

### 4. Fast-Track Customs Liaison
Complementary arrival assistance and fast-track clearance services at the private terminal for delegates arriving via private charter.

*Limited to 100 passes to ensure exclusivity.*
`
  },
  {
    id: 'tpl_sponsor_announcement',
    name: 'Headline Sponsor Partnership',
    description: 'Announcing a partnership with a major headline or platinum sponsor.',
    title: 'NBAC 2026 Welcomes [Sponsor Name] as Official Headline Sponsor',
    type: 'Sponsor Update',
    body: `# Partner Announcement

We are delighted to welcome **[Sponsor Name]**, a global leader in [corporate aircraft management / private jet charters / aviation finance], as the official Headline Sponsor of the Nigerian Business Aviation Conference (NBAC) 2026.

## A Shared Vision for African Aviation
This partnership reflects our shared commitment to driving safety, efficiency, and infrastructural investment in the African business aviation ecosystem.

> "We are thrilled to support NBAC 2026. West Africa represents one of the most dynamic business aviation markets globally, and we are proud to facilitate the conversations shaping its future."
> — *[Executive Name], CEO of [Sponsor Name]*

### Showcase & Exhibition
During the conference, **[Sponsor Name]** will:
* Host the Opening Welcome Reception on Day 1.
* Feature an interactive exhibition stand in **Hangar Booth A1**.
* Present a case study on "Optimizing Regional Fleet Management" during the afternoon panel.

Make sure to visit their team during the networking sessions.
`
  },
  {
    id: 'tpl_static_display_preview',
    name: 'Static Aircraft Display Preview',
    description: 'Highlighting the private jets and helicopters on the tarmac/static display.',
    title: 'Exclusive Preview: Super Midsize and Large-Cabin Jets Headed to the Static Display',
    type: 'Event Copy',
    body: `# Tarmac Preview: The Static Display

The **Static Display** is the visual centerpiece of NBAC 2026. This year, we are hosting an expanded lineup of corporate jets, turboprops, and multi-mission helicopters on the private apron.

## Confirmed Aircraft Highlights:
* **Bombardier Challenger 3500:** Experience the revolutionary Nuage seats and advanced cabin technology.
* **Gulfstream G600:** Engineered for high-speed, long-range comfort and class-leading fuel efficiency.
* **Embraer Praetor 600:** The most disruptive super-midsize jet in the skies today.
* **AgustaWestland AW139:** The standard in executive helicopter transport across the Gulf of Guinea.

### Visiting Guidelines:
1. **Access:** Static display is open to VIP Executive and Exhibitor Pass holders only.
2. **Scheduling:** Private onboard tours must be reserved in advance via the exhibitor terminal.
3. **Safety:** High heels are strictly prohibited on the tarmac. Escorted tours leave the main lobby every 30 minutes.

*Aircraft display lineup is subject to operational availability.*
`
  },
  {
    id: 'tpl_hotel_rates',
    name: 'Partner Hotels & Negotiated Rates',
    description: 'Advisory for hotel partners, negotiated rates, and shuttle arrangements.',
    title: 'Exclusive Delegate Rates Secured at Partner Five-Star Hotels',
    type: 'Announcement',
    body: `# Accommodation & Partner Hotels

To ensure a seamless experience for all international and out-of-town attendees, NBAC has partnered with Lagos's leading five-star hotels to offer discounted room rates and dedicated concierge services.

## Confirmed Partner Hotels

### 1. Eko Hotels & Suites (Venue Hotel)
* **Discount Rate:** 15% off Classic and Signature Suites
* **Promo Code:** \`NBAC2026-EKO\`
* **Benefits:** Immediate access to conference halls, complementary spa amenities.

### 2. The Wheatbaker Ikoyi (Boutique Partner)
* **Discount Rate:** 20% off Executive Rooms
* **Promo Code:** \`NBAC2026-TWB\`
* **Benefits:** 15-minute executive shuttle to venue, boutique privacy.

### 3. Radisson Blu Anchorage (Waterfront Hotel)
* **Discount Rate:** 18% off Superior Rooms
* **Promo Code:** \`NBAC2026-RAD\`
* **Benefits:** Complimentary water taxi transport to the conference docks.

> **Booking Note:** To secure these negotiated rates, reservations must be completed through our partner links or via email before **October 15, 2026**.
`
  },
  {
    id: 'tpl_fbo_logistics',
    name: 'FBO & Customs Guide (Private Flights)',
    description: 'Information for flight crews and operators arriving via private aircraft.',
    title: 'Flight Operations Guide: FBO Services and Customs Clearance for NBAC 2026',
    type: 'Announcement',
    body: `# Flight Crew & Operations Advisory

For delegates arriving via private or corporate aircraft at Murtala Muhammed International Airport (DNMM), Lagos, please review the following flight operational guidelines.

## Handling & FBO Terminals
All business aircraft must coordinate their arrivals and ground handling with our designated FBO partners:
* **ExecuJet Aviation Nigeria** (West Apron)
* **Evergreen Apple Nigeria (EAN)** (North Apron)

### Slots & Permits
Due to increased traffic during the conference week, operators are advised to request landing permits and slot allocations at least **7 days prior** to departure.

### Customs, Immigration & Quarantine (CIQ)
* Expedited CIQ clearances will be available at the FBO terminals for VIP delegates.
* Please submit flight manifest details and crew passport copies to the NBAC Logistics Desk for pre-clearance.
* Fueling, catering, and ground power units (GPU) should be booked directly with the handling agent.

**Operations Hotline:** operations@nbac.ng (Available 24/7 during event week)
`
  },
  {
    id: 'tpl_panel_spotlight',
    name: 'Panel Session Spotlight',
    description: 'Focusing on a specific high-value panel and its panelists.',
    title: 'Panel Highlight: Navigating Asset Financing and Leasing Regulations in Nigeria',
    type: 'Event Copy',
    body: `# Panel Spotlight: Jet Finance & Leasing

Aircraft acquisition remains one of the most complex hurdles in African business aviation. On Day 2 of NBAC 2026, our experts will dissect the financial models making private aircraft ownership viable in today's economy.

## Discussion Core Themes:
* **Cross-border Leases:** Overcoming structural bottlenecks in currency exchange and offshore financing.
* **Cape Town Convention implementation:** How Nigeria's legal reforms are lowering insurance premiums for local operators.
* **Syndicated Debt Models:** How local financial groups are collaborating on capital projects.

### Panelists:
* **Moderator:** *Adebayo Alao* (Senior Partner, AeroLaw Advisory)
* **Panelist:** *Chinedu Nwosu* (Director of Corporate Banking, Access Bank)
* **Panelist:** *Sophie Vance* (VP African Markets, Global Jet Capital)
* **Panelist:** *Captain Ibrahim Bello* (MD, FlySafe Operators)

*Date: Day 2 — November 13, 2026  
Time: 11:30 AM - 12:45 PM  
Room: Falcon Amphitheatre*
`
  },
  {
    id: 'tpl_agenda_release',
    name: 'Daily Schedule & Agenda Release',
    description: 'Rundown of the conference schedule, breakout sessions, and dinners.',
    title: 'Published Agenda: Day-by-Day Session Schedule & Cocktail Receptions',
    type: 'Announcement',
    body: `# Conference Agenda Overview

Plan your conference experience. The official schedule for NBAC 2026 features two days of intensive panels, workshops, and exhibitions, followed by aircraft display tours.

---

## Day 1 — November 12, 2026
* **08:30 - 09:30:** Registration & Welcoming Coffee (Main Lobby)
* **09:45 - 10:30:** Opening Ceremony & Ministerial Keynote (Ballroom A)
* **10:45 - 12:00:** Panel 1: *State of the Industry: African Business Aviation Review*
* **12:00 - 13:30:** Networking Lunch & Exhibition Walkthrough
* **13:45 - 15:00:** Panel 2: *FBO Infrastructure and Regional Hub Strategy*
* **18:00 - 21:00:** Welcome Networking Cocktail (Docks Waterfront)

---

## Day 2 — November 13, 2026
* **09:00 - 10:15:** Panel 3: *Aircraft Maintenance (MRO) Capabilities in West Africa*
* **10:30 - 11:45:** Workshop: *Regulatory Alignment & Safety Management Systems*
* **12:00 - 13:30:** Matchmaking Lunch (VIP Pass Holders only)
* **14:00 - 17:00:** Guided Tours of the Static Apron Display
* **19:30 - 23:00:** NBAC Gala Dinner & Charity Auction (Grand Hall)
`
  },
  {
    id: 'tpl_post_event_wrapup',
    name: 'Post-Event Wrap-Up',
    description: 'Post-conference wrap-up summarizing successes and attendance metrics.',
    title: 'NBAC 2026 Concludes with Landmark Agreements and Industry Commitment',
    type: 'Press Release',
    body: `# NBAC 2026 Concludes with Historic Success

**LAGOS, NIGERIA** — The Nigerian Business Aviation Conference 2026 concluded yesterday, establishing a new record in regional participation, commercial deals, and government engagement.

## Key Event Metrics:
* **Delegates:** 580+ registrants from 18 countries.
* **Exhibitors:** 42 global and regional aviation firms.
* **Apron Display:** 8 modern business aircraft and helicopters.
* **Deals Signed:** 3 strategic memoranda of understanding in MRO and FBO partnerships.

The central consensus of this year's panels is that African business aviation is shifting from a luxury commodity to a vital infrastructure tool for corporate mobility and economic growth.

> "This has been our most impactful year. We saw active collaboration between private capital, regulators, and flight departments. The path is set for a more unified West African airspace." 
> — *Conference Coordinator*

### Photo Gallery & Presentations
VIP delegates will receive an email containing access credentials to the media vault, which features session video recordings, panel presentations, and high-resolution tarmac photos.

*We look forward to welcoming you back for NBAC 2027!*
`
  }
];
