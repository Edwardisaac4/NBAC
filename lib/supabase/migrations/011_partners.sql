-- =============================================================
-- MIGRATION 011: partners
-- =============================================================
-- Sponsor logos for the homepage partner wall, grouped by package tier
-- (Platinum, Gold, Silver, Bronze). Managed from /admin/partners; logos are
-- uploaded to the existing public `media` storage bucket.
--
-- The public may read only rows marked visible. Admins (head_admin, editor)
-- see and manage every row. Two SELECT policies for `authenticated` are
-- OR-ed together, so an admin is not limited to visible rows.
--
-- Safe to run more than once (IF NOT EXISTS / DROP POLICY IF EXISTS).
-- Run in the Supabase SQL editor.
-- =============================================================

CREATE TABLE IF NOT EXISTS public.partners (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    tier text NOT NULL CHECK (tier IN ('platinum', 'gold', 'silver', 'bronze')),
    logo_url text NOT NULL,
    storage_path text,
    website_url text,
    sort_order integer NOT NULL DEFAULT 0,
    visible boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS partners_tier_sort_idx
    ON public.partners (tier, sort_order);

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read visible partners" ON public.partners;
CREATE POLICY "Public read visible partners" ON public.partners
    FOR SELECT TO anon, authenticated USING (visible = true);

DROP POLICY IF EXISTS "Admin manage partners" ON public.partners;
CREATE POLICY "Admin manage partners" ON public.partners
    FOR ALL USING (public.user_role() IN ('head_admin', 'editor'))
    WITH CHECK (public.user_role() IN ('head_admin', 'editor'));

GRANT SELECT ON public.partners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partners TO authenticated, service_role;
