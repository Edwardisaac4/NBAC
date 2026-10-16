-- =============================================================
-- MIGRATION 009: press_accreditations
-- =============================================================
-- Journalist / media accreditation requests submitted from
-- /contact/press via /api/register/press, reviewed in /admin/press.
--
-- anon may INSERT only — no SELECT — so a submitted request can never
-- be read back through the public key. Admins (head_admin, editor)
-- read and set status through the same user_role() policy every other
-- intake table uses.
--
-- Safe to run more than once (IF NOT EXISTS / DROP POLICY IF EXISTS).
-- Run in the Supabase SQL editor, or via `supabase db push`.
-- =============================================================

CREATE TABLE IF NOT EXISTS public.press_accreditations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reference text UNIQUE NOT NULL,
    full_name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    job_title text NOT NULL,
    outlet text NOT NULL,
    media_type text NOT NULL,
    country text,
    outlet_website text,
    portfolio_url text,
    press_card_number text,
    coverage_plan text,
    additional_crew text,
    consent boolean NOT NULL DEFAULT false,
    status text NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'declined')),
    reviewed_at timestamptz,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS press_accreditations_created_at_idx
    ON public.press_accreditations (created_at DESC);

ALTER TABLE public.press_accreditations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert press accreditations" ON public.press_accreditations;
CREATE POLICY "Public insert press accreditations" ON public.press_accreditations
    FOR INSERT TO anon WITH CHECK (
        status = 'pending'
        AND consent = true
        AND reviewed_at IS NULL
        AND media_type IN ('print', 'online', 'television', 'radio', 'photography', 'trade', 'podcast', 'freelance')
    );

DROP POLICY IF EXISTS "Admin manage press accreditations" ON public.press_accreditations;
CREATE POLICY "Admin manage press accreditations" ON public.press_accreditations
    FOR ALL USING (public.user_role() IN ('head_admin', 'editor'))
    WITH CHECK (public.user_role() IN ('head_admin', 'editor'));

GRANT INSERT ON public.press_accreditations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.press_accreditations TO authenticated, service_role;
