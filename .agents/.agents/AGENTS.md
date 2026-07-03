# AGENTS.md — NBAC Platform
### Nigerian Business Aviation Conference — Full-Stack Digital Platform

This file is the authoritative context document for all AI agents working on this
codebase. Read this entire file before writing, editing, or reviewing any code.
Do not make assumptions about the stack, design system, or architecture — all
decisions are documented here. If something is not covered here, ask before guessing.

---

## 1. PROJECT OVERVIEW

**What is NBAC?**
The Nigerian Business Aviation Conference (NBAC) is West Africa's premier business
aviation conference. It brings together high-net-worth individuals, aircraft operators,
aviation regulators, finance providers, and industry executives for a multi-day
event combining panel sessions, aircraft displays, and exhibition booths.

**What is this platform?**
A full-stack digital platform that serves two distinct audiences:

1. **Public delegates** — browse conference info, register for passes, and pay
   directly via Paystack. No accounts, no portal, no login. Registration is a
   single linear flow: fill form → pay → receive confirmation email with booking
   reference. That's it.

2. **Internal admins (max 5)** — manage website content, monitor registrations,
   export delegate data, update the media gallery, and audit system logs via a
   protected admin dashboard.

This is NOT a general-purpose CMS or SaaS product. Every architectural decision
is made specifically for a high-end conference platform with a premium dark luxury
aesthetic targeting executive-level users.

**CRITICAL ARCHITECTURE DECISION — NO DELEGATE ACCOUNTS:**
Delegates do NOT create accounts, do NOT log in, and do NOT have a portal.
Supabase Auth is used EXCLUSIVELY for the 5 internal admins.
Delegates are stored as rows in the `delegates` table with no auth record attached.
Do not implement magic links, OTP, delegate sessions, or any delegate-facing auth.
Everything a delegate needs is delivered via email (Resend) after registration.

---

## 2. TECH STACK (Non-Negotiable)

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js | 15 (App Router) |
| Language | TypeScript | Strict mode |
| Styling | Tailwind CSS | Latest |
| UI Components | shadcn/ui | New York preset, Zinc base, Nova-Lucide icons |
| Fonts | Cormorant Garamond + Inter | Via next/font/google |
| Database | Supabase (PostgreSQL) | Latest JS SDK |
| Auth | Supabase Auth | @supabase/ssr for App Router |
| Storage | Supabase Storage | Conference media/images |
| Payments | Paystack | react-paystack + server-side verification |
| Emails | Resend | Transactional only |
| Forms | React Hook Form + Zod | @hookform/resolvers |
| Data Fetching | TanStack Query | Admin dashboard client-side |
| Data Tables | TanStack Table | Admin data grids |
| Animation | Framer Motion + GSAP | Both — see Section 9 |
| Carousel | Embla Carousel | + embla-carousel-autoplay |
| File Upload | react-dropzone | Admin media gallery |
| Charts | Recharts | Admin overview dashboard |
| Date Utils | date-fns | Formatting only |
| Icons | Lucide React | Via shadcn Nova preset |
| Deployment | Vercel | Frontend — zero config |

**Do NOT introduce any library not in this list without explicit instruction.**
Do NOT use Clerk, NextAuth, Prisma, Drizzle, or any alternative to the above.
Do NOT use React Query v3 — use TanStack Query v5.

---

## 3. PROJECT STRUCTURE

```
nbac-platform/
├── src/
│   ├── app/
│   │   ├── (public)/                    # Public-facing routes (SSG)
│   │   │   ├── layout.tsx               # Public layout (Navbar + Footer)
│   │   │   ├── page.tsx                 # Home page
│   │   │   ├── events/
│   │   │   │   └── page.tsx
│   │   │   ├── hotels/
│   │   │   │   └── page.tsx
│   │   │   ├── about/
│   │   │   │   └── page.tsx
│   │   │   ├── contact/
│   │   │   │   └── page.tsx
│   │   │   └── reservations/
│   │   │       └── page.tsx             # Pass tier selection + Paystack (NO AUTH)
│   │   ├── (admin)/                     # Admin-only routes (email/password auth)
│   │   │   ├── layout.tsx               # Admin shell (sidebar + topbar)
│   │   │   └── admin/
│   │   │       ├── login/
│   │   │       │   └── page.tsx         # Admin login (email/password only)
│   │   │       ├── page.tsx             # Overview dashboard (KPIs + chart)
│   │   │       ├── content/
│   │   │       │   └── page.tsx         # Content & posting manager
│   │   │       ├── reservations/
│   │   │       │   └── page.tsx         # Reservation intake vault
│   │   │       ├── media/
│   │   │       │   └── page.tsx         # Media gallery updater
│   │   │       └── logs/
│   │   │           └── page.tsx         # Security logs (Head Admin only)
│   │   ├── api/
│   │   │   ├── webhooks/
│   │   │   │   └── paystack/
│   │   │   │       └── route.ts         # Paystack payment webhook handler
│   │   │   ├── registrations/
│   │   │   │   └── route.ts             # Create registration + send email
│   │   │   ├── inquiries/
│   │   │   │   └── route.ts             # Hotel / charter inquiry submission
│   │   │   └── admin/
│   │   │       └── export/
│   │   │           └── registrations/
│   │   │               └── route.ts     # Export registrations as .xlsx or .csv
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts             # Supabase auth callback (admin only)
│   │   ├── globals.css
│   │   └── layout.tsx                   # Root layout (fonts + metadata)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── navbar.tsx               # Global sticky glassmorphism navbar
│   │   │   ├── footer.tsx               # Global footer
│   │   │   ├── admin-sidebar.tsx        # Admin portal fixed sidebar
│   │   │   └── admin-topbar.tsx         # Admin portal top bar
│   │   ├── sections/                    # Home page sections
│   │   │   ├── hero-section.tsx
│   │   │   ├── state-section.tsx        # "State of Nigerian Business Aviation"
│   │   │   ├── audience-section.tsx     # "This Conference Is For..."
│   │   │   ├── testimonials-section.tsx
│   │   │   └── sponsors-strip.tsx
│   │   ├── ui/                          # shadcn/ui generated components (DO NOT EDIT)
│   │   ├── shared/                      # Shared custom components
│   │   │   ├── stat-counter.tsx         # Animated number counter
│   │   │   ├── section-eyebrow.tsx      # Small uppercase label component
│   │   │   ├── pass-tier-card.tsx       # VIP / Exhibitor / Jet Display card
│   │   │   ├── hotel-card.tsx
│   │   │   ├── speaker-chip.tsx         # Avatar + name + title
│   │   │   └── status-badge.tsx         # Paid / Pending / Cancelled etc.
│   │   └── admin/                       # Admin-specific components
│   │       ├── kpi-card.tsx
│   │       ├── reservations-table.tsx
│   │       ├── content-table.tsx
│   │       ├── export-registrations.tsx # Date filter + xlsx/csv download buttons
│   │       ├── media-upload-zone.tsx
│   │       ├── media-gallery-grid.tsx
│   │       ├── logs-table.tsx
│   │       ├── edit-drawer.tsx          # Slide-in edit panel (all modules)
│   │       └── role-banner.tsx          # Head Admin mode banner
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                # Browser client (createBrowserClient)
│   │   │   ├── server.ts                # Server client (createServerClient)
│   │   │   └── middleware.ts            # Session refresh + auth check
│   │   ├── actions/                     # Next.js Server Actions
│   │   │   ├── registration.ts
│   │   │   ├── inquiry.ts
│   │   │   └── content.ts
│   │   ├── paystack.ts                  # Paystack helpers + verification
│   │   ├── resend.ts                    # Resend email templates + send helpers
│   │   ├── booking-reference.ts         # Generates unique NBAC-YYYY-TIER-XXXXX refs
│   │   └── utils.ts                     # cn() + general helpers
│   ├── hooks/
│   │   ├── use-admin-role.ts            # Returns current admin role
│   │   └── use-stat-counter.ts          # Animated counter on scroll
│   ├── types/
│   │   └── index.ts                     # All TypeScript interfaces (see Section 7)
│   └── middleware.ts                    # Route protection (admin only)
├── public/
│   └── images/
├── AGENTS.md                            # This file
├── .env.local                           # Never commit — see Section 10
├── tailwind.config.ts
├── next.config.ts
└── tsconfig.json
```

---

## 4. ROUTING & LAYOUT STRATEGY

### Route Groups
The App Router uses route groups to separate concerns without affecting URL paths.

- `(public)` — No auth required. All pages including `/reservations` are public.
  Pages are statically generated at build time. The reservations page is public
  because delegates do not log in — they just fill a form and pay.
- `(admin)` — Supabase email/password session with role check required. Redirects
  to `/admin/login` if no session. Head Admin and Editor both access this group
  but the role gates specific features (see Section 6).

There is NO `(delegate)` route group. There is NO `/portal` route.
Delegates are anonymous users — they have no session, no account, no protected routes.

### Middleware (src/middleware.ts)
Middleware runs on every request. It:
1. Refreshes the Supabase session cookie
2. Redirects unauthenticated users away from `/admin/*`
3. Redirects authenticated admins away from `/admin/login`

```ts
// Only admin routes are protected — nothing else
const ADMIN_ROUTES = ['/admin']
```

### Static Pages (SSG)
All `(public)` pages use `export const dynamic = 'force-static'` or are statically
generated by default. Do NOT use `useEffect` for initial data fetching on these pages.
Fetch data in Server Components and pass as props.

---

## 5. DATABASE SCHEMA (Supabase / PostgreSQL)

### Tables

**delegates**
```sql
id              uuid primary key default gen_random_uuid()
email           text unique not null
full_name       text not null
company         text
phone           text
created_at      timestamptz default now()
```

**registrations**
```sql
id                  uuid primary key default gen_random_uuid()
delegate_id         uuid references delegates(id)
pass_tier           text not null  -- 'vip' | 'exhibitor' | 'jet_display'
payment_status      text not null default 'pending'  -- 'pending' | 'paid' | 'cancelled'
paystack_reference  text unique
amount              numeric(12, 2)
booking_date        timestamptz default now()
special_requirements text
```

**inquiries**
```sql
id              uuid primary key default gen_random_uuid()
full_name       text not null
email           text not null
company         text
phone           text
inquiry_type    text not null  -- 'general' | 'hotel' | 'charter' | 'sponsorship' | 'media' | 'vip'
message         text
status          text default 'open'  -- 'open' | 'in_progress' | 'resolved'
created_at      timestamptz default now()
```

**content_posts**
```sql
id          uuid primary key default gen_random_uuid()
title       text not null
type        text not null  -- 'announcement' | 'press' | 'event_copy' | 'sponsor_update'
status      text default 'draft'  -- 'draft' | 'published'
body        text
author_id   uuid references auth.users(id)
created_at  timestamptz default now()
updated_at  timestamptz default now()
```

**media**
```sql
id            uuid primary key default gen_random_uuid()
file_name     text not null
file_url      text not null
storage_path  text not null
tags          text[]  -- e.g. ['Day 1', 'Keynote', 'Aircraft Display']
uploaded_by   uuid references auth.users(id)
created_at    timestamptz default now()
sort_order    integer default 0
```

**admin_logs**
```sql
id          uuid primary key default gen_random_uuid()
admin_id    uuid references auth.users(id)
action      text not null  -- 'published' | 'edited' | 'deleted' | 'login' | 'permission_changed'
target      text  -- human-readable description of what was changed
ip_address  text
created_at  timestamptz default now()
```

### Row Level Security (RLS)
Every table has RLS enabled. Key policies:

- `delegates` — delegates can only read/update their own row. Admins have full access.
- `registrations` — delegates read their own. Admins read all.
- `content_posts` — public can read `status = 'published'`. Admins can read/write all.
- `media` — public can read all. Only admins can insert/update/delete.
- `admin_logs` — only Head Admin role can read. All admin actions auto-insert via trigger.
- `inquiries` — no public read. Admins only.

### Admin Role System
Admin roles are stored in `auth.users` metadata, NOT a separate table.
Set on user creation:

```ts
// Head Admin
{ role: 'head_admin' }

// Standard Admin
{ role: 'editor' }
```

Access in server code:
```ts
const { data: { user } } = await supabase.auth.getUser()
const role = user?.user_metadata?.role  // 'head_admin' | 'editor'
```

---

## 6. USER TYPES & PERMISSIONS

### Public Visitor / Delegate
- No auth required — no account, no session, no login
- Can browse all public pages
- Can fill and submit the registration form + pay via Paystack
- Receives a confirmation email with booking reference after successful payment
- Cannot access `/admin/*` — full stop
- The `delegates` table stores their info but there is NO linked auth.users record

### Editor (Standard Admin)
- Authenticated via Supabase email/password
- Can access all `/admin/*` routes except `/admin/logs`
- Can Edit and Publish on all modules
- CANNOT Delete any record
- CANNOT view the Security Logs module — it must not render in their sidebar

### Head Admin
- Authenticated via Supabase email/password
- Full access to all `/admin/*` routes including `/admin/logs`
- Can Edit, Publish, and Delete on all modules
- Sees the Head Admin mode banner across all admin pages
- Can view the audit dropdown to review Editor activity
- Can export registrations as `.xlsx` or `.csv`

**Always check `role` before rendering delete buttons or the logs nav item.**
Never hide these with CSS — conditionally render them in JSX.

**Supabase Auth is admin-only.** Do not create auth accounts for delegates.
Do not implement magic links, OTP sessions, or any delegate-facing authentication.

---

## 7. TYPESCRIPT INTERFACES

All interfaces live in `src/types/index.ts`. Import from there — never redefine locally.

```ts
// User types
export type AdminRole = 'head_admin' | 'editor'

export interface AdminUser {
  id: string
  email: string
  role: AdminRole
  full_name?: string
}

export interface Delegate {
  id: string
  email: string
  full_name: string
  company?: string
  phone?: string
  created_at: string
}

// Registration
export type PassTier = 'vip' | 'exhibitor' | 'jet_display'
export type PaymentStatus = 'pending' | 'paid' | 'cancelled'

export interface Registration {
  id: string
  delegate_id: string
  delegate?: Delegate
  pass_tier: PassTier
  payment_status: PaymentStatus
  paystack_reference?: string
  amount: number
  booking_date: string
  special_requirements?: string
}

// Content
export type ContentType = 'announcement' | 'press' | 'event_copy' | 'sponsor_update'
export type ContentStatus = 'draft' | 'published'

export interface ContentPost {
  id: string
  title: string
  type: ContentType
  status: ContentStatus
  body?: string
  author_id: string
  created_at: string
  updated_at: string
}

// Inquiries
export type InquiryType = 'general' | 'hotel' | 'charter' | 'sponsorship' | 'media' | 'vip'
export type InquiryStatus = 'open' | 'in_progress' | 'resolved'

export interface Inquiry {
  id: string
  full_name: string
  email: string
  company?: string
  phone?: string
  inquiry_type: InquiryType
  message: string
  status: InquiryStatus
  created_at: string
}

// Media
export interface MediaFile {
  id: string
  file_name: string
  file_url: string
  storage_path: string
  tags: string[]
  uploaded_by: string
  created_at: string
  sort_order: number
}

// Admin logs
export type LogAction = 'published' | 'edited' | 'deleted' | 'login' | 'permission_changed'

export interface AdminLog {
  id: string
  admin_id: string
  admin?: AdminUser
  action: LogAction
  target?: string
  ip_address?: string
  created_at: string
}

// Events page
export type SessionCategory = 'keynote' | 'panel' | 'workshop' | 'break' | 'networking'
export type ConferenceDay = 'day_1' | 'day_2'

export interface Speaker {
  id: string
  name: string
  title: string
  company: string
  avatar_url?: string
}

export interface EventSession {
  id: string
  day: ConferenceDay
  start_time: string
  end_time: string
  category: SessionCategory
  title: string
  abstract?: string
  speakers: Speaker[]
  location?: string
}

// Pass tiers
export interface PassTierDetails {
  id: PassTier
  name: string
  price: number
  currency: 'NGN'
  privileges: string[]
  availability: 'available' | 'limited' | 'sold_out'
  badge?: string
}

// Hotel
export interface PartnerHotel {
  id: string
  name: string
  stars: number
  distance_km: number
  promo_code: string
  amenities: string[]
  image_url?: string
  booking_url: string
}

// FBO / Flight logistics
export interface FBOTerminal {
  id: string
  name: string
  icao_code: string
  location: string
  services: string[]
  phone: string
  email: string
  coordinates?: { lat: number; lng: number }
}

// Form schemas (Zod)
export interface RegistrationFormData {
  pass_tier: PassTier
  full_name: string
  company: string
  email: string
  phone: string
  delegate_count: number
  special_requirements?: string
}

export interface InquiryFormData {
  full_name: string
  company?: string
  email: string
  phone?: string
  inquiry_type: InquiryType
  message: string
}

// API responses
export interface ApiResponse<T> {
  data?: T
  error?: string
  success: boolean
}

// Paystack
export interface PaystackResponse {
  reference: string
  status: 'success' | 'failed'
  trans: string
  transaction: string
  message: string
}
```

---

## 8. DESIGN SYSTEM

### Color Tokens
**Always use `nbac-*` tokens. Never hardcode hex values in components.**

```
nbac-canvas          Background of every page
nbac-panel           Cards, panels, form containers
nbac-alt             Alternate section backgrounds (for visual rhythm)
nbac-deep            Footer, admin sidebar, admin app shell
nbac-border          All borders and dividers
nbac-muted           Placeholder text, timestamps, meta labels
nbac-body            Body copy, secondary text
nbac-text            Headings, primary content
nbac-emerald         Primary accent — CTAs, active states, badges
nbac-emerald-dark    Button hover state
nbac-emerald-light   Eyebrow labels, icons, decorative elements
nbac-amber           Pending / Limited / Warning states
nbac-danger          Cancelled / Sold Out / Error / Delete
```

### Typography Rules

**Display headings (hero, section titles, pull quotes):**
```tsx
<h1 className="font-display text-5xl font-bold text-nbac-text tracking-tight leading-none">
```

**UI headings (cards, module titles, nav):**
```tsx
<h3 className="font-sans text-lg font-semibold text-nbac-text">
```

**Body copy:**
```tsx
<p className="font-sans text-base font-light text-nbac-body leading-relaxed">
```

**Eyebrow labels (always above section headings):**
```tsx
<span className="font-sans text-xs uppercase tracking-widest font-medium text-nbac-emerald-light">
  THE PINNACLE OF WEST AFRICAN AVIATION
</span>
```

**Muted / Meta text:**
```tsx
<span className="font-sans text-sm text-nbac-muted">
  3 minutes ago
</span>
```

### Component Patterns

**Standard card:**
```tsx
<div className="bg-nbac-panel border border-nbac-border rounded-lg p-6">
```

**Card with emerald left accent (pillar cards, session rows):**
```tsx
<div className="bg-nbac-panel border border-nbac-border rounded-lg p-6 border-l-4 border-l-nbac-emerald">
```

**Primary button:**
```tsx
<button className="bg-nbac-emerald hover:bg-nbac-emerald-dark text-white font-sans font-medium px-6 py-2.5 rounded-full transition-colors shadow-lg shadow-nbac-emerald/20">
```

**Outline button (secondary CTA):**
```tsx
<button className="border border-nbac-border text-nbac-body hover:bg-nbac-panel font-sans font-medium px-6 py-2.5 rounded-full transition-colors">
```

**Form inputs:**
```tsx
<input className="w-full bg-nbac-canvas border border-nbac-border rounded-lg px-4 py-3 text-nbac-text placeholder:text-nbac-muted font-sans text-sm focus:outline-none focus:border-nbac-emerald focus:ring-1 focus:ring-nbac-emerald transition-colors" />
```

**Status badges:**
```tsx
// Paid / Active / Published
<span className="bg-nbac-emerald/15 text-nbac-emerald text-xs font-medium px-2.5 py-1 rounded-full">
  Paid
</span>

// Pending / Limited / Warning
<span className="bg-nbac-amber/15 text-nbac-amber text-xs font-medium px-2.5 py-1 rounded-full">
  Pending
</span>

// Cancelled / Sold Out / Error
<span className="bg-nbac-danger/15 text-nbac-danger text-xs font-medium px-2.5 py-1 rounded-full">
  Cancelled
</span>
```

**Glassmorphism navbar:**
```tsx
<nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-nbac-canvas/85 border-b border-nbac-border">
```

**Admin sidebar item (active state):**
```tsx
<div className="border-l-[3px] border-nbac-emerald bg-nbac-emerald/10 text-white">
```

### Section Rhythm
Alternate page sections between `bg-nbac-canvas` and `bg-nbac-alt` so there's
visual separation without hard borders. Never use white or light backgrounds.
Sections have `py-20 md:py-32` vertical padding — never crowd them.

---

## 9. ANIMATION RULES

### When to use GSAP vs Framer Motion

**Use GSAP for:**
- Hero scroll effects and parallax
- Stats counter animation (count up from 0 on scroll into view)
- Sponsor strip infinite marquee scroll
- ScrollTrigger-based reveal animations on public pages
- Any animation involving timeline sequencing

**Use Framer Motion for:**
- Page transitions between routes
- Card hover states and micro-interactions
- Admin drawer slide-in (edit panel)
- Modal entrance/exit animations
- Stagger animations on grid items

### Animation principles
- Reveal animations: elements fade up (`y: 20 → 0, opacity: 0 → 1`) on scroll entry
- Duration: 0.4s–0.6s for UI interactions, 0.8s–1.2s for scroll reveals
- Easing: `ease: [0.25, 0.1, 0.25, 1]` (ease-in-out cubic)
- Never animate on desktop hover on mobile — use `useReducedMotion` check
- Sponsor marquee: CSS `@keyframes` for performance, not JS

---

## 10. KEY FLOWS (Reference Before Building Any Feature)

### Delegate Registration Flow
1. Delegate lands on `/reservations` — sees 3 pass tier cards
2. Selects a tier → right column form activates for that tier
3. Fills form (name, company, email, phone) — validated with Zod
4. Clicks "Secure Executive Pass" → `react-paystack` inline popup opens
5. Paystack processes NGN payment
6. On `onSuccess` callback → POST to `/api/registrations` with `paystack_reference`
7. Route handler verifies payment server-side with Paystack API
8. On verified → generate unique booking reference (e.g. `NBAC-2025-VIP-00142`)
9. Insert row into `delegates` table (upsert on email)
10. Insert row into `registrations` table with `payment_status: 'paid'`
11. Resend fires confirmation email to delegate containing:
    - Booking reference
    - Pass tier details
    - Conference date and venue
    - Contact info for any changes
12. Show success message on the page — no redirect to portal, no account created

### Hotel / Charter Inquiry Flow
1. Visitor submits inquiry form on `/hotels` or `/contact`
2. POST to `/api/inquiries` → insert into `inquiries` table
3. Resend fires acknowledgement email to visitor + notification email to admin inbox
4. Admin follows up manually through the admin dashboard

### Admin Login Flow
1. Admin visits `/admin/login` → email/password form
2. `supabase.auth.signInWithPassword()` called
3. On success → middleware reads `user_metadata.role`
4. Redirected to `/admin` dashboard
5. Role stored in React context for the session
6. `use-admin-role` hook exposes role to all admin components

### Registration Export Flow (Admin)
1. Admin goes to `/admin/reservations`
2. Optionally selects a date to filter by day
3. Clicks "Export Excel" or "Export CSV"
4. GET `/api/admin/export/registrations?format=xlsx&date=2025-10-14`
5. Route handler verifies admin role
6. Queries `registrations` joined with `delegates` filtered by date
7. Native CSV/text-based generation builds the workbook/content with formatted columns
8. Browser downloads the file directly
9. For Google Sheets: admin imports the CSV via File → Import in Google Sheets

### Paystack Webhook
1. Paystack POSTs to `/api/webhooks/paystack`
2. Route handler verifies `x-paystack-signature` header with HMAC
3. On `charge.success` event → update `payment_status` to `'paid'` in Supabase
4. Fire confirmation email if not already sent (safety net for dropped callbacks)

---

## 11. ENVIRONMENT VARIABLES

Required in `.env.local`. Never commit this file.

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
PAYSTACK_SECRET_KEY=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@nbac.com.ng

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 12. SUPABASE CLIENT SETUP

Always use the correct client for the context. Using the wrong one causes auth
issues and security vulnerabilities.

```ts
// src/lib/supabase/client.ts — Browser/Client Components only
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// src/lib/supabase/server.ts — Server Components, Route Handlers, Server Actions only
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

---

## 13. CODING CONVENTIONS

### File naming
- Components: `kebab-case.tsx` (e.g., `pass-tier-card.tsx`)
- Hooks: `use-kebab-case.ts`
- Types: all in `src/types/index.ts`
- Server actions: `src/lib/actions/feature-name.ts`
- Utilities: `src/lib/utils.ts`

### Component exports
- Use **named exports** for all components except `page.tsx` and `layout.tsx`
- `page.tsx` and `layout.tsx` use default exports (Next.js requirement)

```tsx
// ✅ Correct — named export
export function PassTierCard({ tier }: PassTierCardProps) { ... }

// ✅ Correct — page file
export default function ReservationsPage() { ... }

// ❌ Wrong — default export on component
export default function PassTierCard() { ... }
```

### TypeScript
- Strict mode is on — no `any`, no `// @ts-ignore`
- All component props must have a typed interface above the component
- All Supabase query results must be typed with the interfaces in `src/types/index.ts`
- Use `const` over `let` wherever possible
- Async Server Components are fine — `async function Page() { const data = await fetch... }`

### Server vs Client Components
- Default to Server Components — only add `'use client'` when the component
  needs `useState`, `useEffect`, event listeners, or browser APIs
- Never import GSAP or Framer Motion in Server Components
- Never use `useRouter` or `useSearchParams` in Server Components

### Error handling
- All Route Handlers return typed `ApiResponse<T>` objects
- Never return raw Supabase errors to the client
- Wrap Supabase calls in try/catch in Server Actions

```ts
// Route handler pattern
export async function POST(request: Request) {
  try {
    const body = await request.json()
    // ... logic
    return Response.json({ success: true, data: result })
  } catch (error) {
    return Response.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}
```

---

## 14. ADMIN DASHBOARD RULES

- The admin shell layout (`(admin)/layout.tsx`) renders the sidebar and topbar.
  Individual admin pages render only the main content area.
- The `role-banner.tsx` component renders at the top of every admin page content
  area when the role is `head_admin`. It does not wrap the layout.
- The Security Logs nav item in the sidebar is conditionally rendered:
  ```tsx
  {role === 'head_admin' && <SidebarItem href="/admin/logs" icon={Lock} label="Security Logs" />}
  ```
- Delete buttons are conditionally rendered across all admin modules:
  ```tsx
  {role === 'head_admin' && <DeleteButton onClick={handleDelete} />}
  ```
- The Edit Drawer (`edit-drawer.tsx`) slides in from the right side on mobile
  and desktop. It never navigates to a new page.
- All destructive actions (delete) show an inline confirmation before executing.
- Every admin mutation (create, update, delete, publish) automatically inserts
  a row into `admin_logs` via a Supabase database trigger — do not log manually
  from application code.

---

## 15. WHAT NOT TO DO

- Do NOT build delegate accounts, a delegate portal, or any delegate-facing auth.
  Delegates are anonymous users — they register, pay, and get an email. Done.
- Do NOT implement magic links, OTP, or Supabase sessions for delegates.
  Supabase Auth is for the 5 admins only.
- Do NOT redirect delegates to a portal or dashboard after registration.
  Show a success message on the reservations page and send a confirmation email.
- Do NOT use `<form action>` Server Actions for the Paystack flow — Paystack
  requires a client-side popup. Use event handlers.
- Do NOT fetch data in `useEffect` for public pages — use Server Components.
- Do NOT use the `service_role` key in client-side code — only in Route Handlers
  and Server Actions.
- Do NOT add `className="dark:..."` anywhere — the entire platform is dark-only.
- Do NOT use inline `style={{ color: '#10B981' }}` — always use nbac-* Tailwind tokens.
- Do NOT wrap the entire admin app in TanStack Query — only use it in admin
  components that need real-time or cached server data.
- Do NOT use `alert()`, `confirm()`, or `prompt()` — use shadcn Dialog/AlertDialog.
- Do NOT add light mode — `<html className="dark">` is set in root layout and stays.
- Do NOT commit `.env.local` or any secrets to git.
