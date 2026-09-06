-- =============================================================
-- MIGRATION: restore tables missing from the live database
-- =============================================================
-- Context: the live Supabase project was created from an older
-- version of schema.sql and never received these three tables.
-- Consequences observed:
--   * /api/interest silently fell back to writing into `contacts`,
--     so /admin/early-birds stayed empty and the "Early Bird Leads"
--     KPI never moved even though submissions were arriving.
--   * /api/register/aerolab and the program editor had the same gap.
--
-- Safe to run more than once (IF NOT EXISTS / DROP POLICY IF EXISTS).
-- Run in the Supabase SQL editor, or via `supabase db push`.
-- =============================================================

-- -------------------------------------------------------------
-- TABLE: aerolab_applications
-- Stores AeroLab Hackathon team applications
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.aerolab_applications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reference text UNIQUE NOT NULL,
    team_name text NOT NULL,
    leader_name text NOT NULL,
    leader_email text NOT NULL,
    leader_phone text,
    organization text,
    track_id integer NOT NULL,
    track_title text NOT NULL,
    member_count integer NOT NULL DEFAULT 3,
    member_roster text,
    proposal_title text NOT NULL,
    concept_note text NOT NULL,
    repo_portfolio_url text,
    status text NOT NULL DEFAULT 'pending',
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.aerolab_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon to insert aerolab applications" ON public.aerolab_applications;
CREATE POLICY "Allow anon to insert aerolab applications" ON public.aerolab_applications
    FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admins to manage aerolab applications" ON public.aerolab_applications;
CREATE POLICY "Allow admins to manage aerolab applications" ON public.aerolab_applications
    FOR ALL USING (public.user_role() IN ('head_admin', 'editor'))
    WITH CHECK (public.user_role() IN ('head_admin', 'editor'));

GRANT INSERT ON public.aerolab_applications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.aerolab_applications TO authenticated, service_role;

-- -------------------------------------------------------------
-- TABLE: program_sessions
-- Dynamic conference schedule sessions (managed from Admin)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.program_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    day integer NOT NULL DEFAULT 1,
    time_slot text NOT NULL,
    title text NOT NULL,
    subtitle text,
    format text NOT NULL DEFAULT 'panel',
    number text,
    panellists jsonb DEFAULT '[]'::jsonb,
    key_areas text[] DEFAULT '{}'::text[],
    questions text[] DEFAULT '{}'::text[],
    notes text,
    is_break boolean NOT NULL DEFAULT false,
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.program_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read program_sessions" ON public.program_sessions;
CREATE POLICY "Public read program_sessions" ON public.program_sessions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage program_sessions" ON public.program_sessions;
CREATE POLICY "Admin manage program_sessions" ON public.program_sessions
    FOR ALL USING (public.user_role() IN ('head_admin', 'editor'))
    WITH CHECK (public.user_role() IN ('head_admin', 'editor'));

GRANT SELECT ON public.program_sessions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.program_sessions TO authenticated, service_role;

-- -------------------------------------------------------------
-- TABLE: interests
-- Stores booth/stand interest submissions and early bird registrations
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.interests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name text NOT NULL,
    job_title text,
    company text,
    country text,
    email text NOT NULL,
    phone text NOT NULL,
    role text NOT NULL DEFAULT 'delegate',
    attendee_count integer NOT NULL DEFAULT 1,
    areas_of_interest text[] DEFAULT '{}'::text[],
    ticket_preference text NOT NULL DEFAULT 'early_bird',
    source text,
    payment_choice text NOT NULL DEFAULT 'pay_later',
    discount_code text,
    consent boolean NOT NULL DEFAULT true,
    signature_data text,
    verification_date text,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert interests" ON public.interests;
CREATE POLICY "Public insert interests" ON public.interests
    FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Admin manage interests" ON public.interests;
CREATE POLICY "Admin manage interests" ON public.interests
    FOR ALL USING (public.user_role() IN ('head_admin', 'editor'))
    WITH CHECK (public.user_role() IN ('head_admin', 'editor'));

GRANT SELECT, INSERT ON public.interests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.interests TO authenticated, service_role;


-- -------------------------------------------------------------
-- BACKFILL: recover interest-form submissions that landed in
-- `contacts` while the `interests` table was missing.
-- The API fallback stamps the message with a known header, so
-- those rows are unambiguous. Parsed field-by-field from message.
-- -------------------------------------------------------------
INSERT INTO public.interests (
    full_name, job_title, company, country, email, phone,
    role, attendee_count, areas_of_interest, ticket_preference,
    source, payment_choice, discount_code, consent, verification_date, created_at
)
SELECT
    c.full_name,
    NULLIF(substring(c.message from 'Job Title: (.*)'), 'N/A'),
    c.company,
    NULLIF(substring(c.message from 'Country: (.*)'), 'N/A'),
    c.email,
    COALESCE(c.phone, 'N/A'),
    COALESCE(substring(c.message from 'Role: (.*)'), 'delegate'),
    COALESCE(NULLIF(substring(c.message from 'Attendees: (\d+)'), '')::int, 1),
    CASE
        WHEN COALESCE(substring(c.message from 'Areas of Interest: (.*)'), 'None') = 'None' THEN '{}'::text[]
        ELSE string_to_array(substring(c.message from 'Areas of Interest: (.*)'), ', ')
    END,
    COALESCE(substring(c.message from 'Ticket Preference: (\S+)'), 'early_bird'),
    NULLIF(substring(c.message from 'Source: (.*)'), 'N/A'),
    COALESCE(substring(c.message from 'Payment Choice: (\S+)'), 'pay_later'),
    substring(c.message from 'discount code: ([A-Z0-9-]+)'),
    true,
    substring(c.message from 'Verification Date: (.*)'),
    c.created_at
FROM public.contacts c
WHERE c.message LIKE '[NBAC STAND INTEREST FORM SUBMISSION]%'
  AND NOT EXISTS (
      SELECT 1 FROM public.interests i
      WHERE i.email = c.email AND i.created_at = c.created_at
  );

-- Force PostgREST to pick up the new tables immediately.
NOTIFY pgrst, 'reload schema';
