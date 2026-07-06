-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------
-- SECURITY ROLE HELPER
-- Reads user role metadata from JWT to enforce secure RLS policies
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS text AS $$
  SELECT coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role'),
    ''
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- -------------------------------------------------------------
-- TABLE: posts
-- Stores articles, press releases, and announcements
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.posts (
    id text PRIMARY KEY,
    title text NOT NULL,
    type text NOT NULL,
    status text NOT NULL,
    author_id text,
    author text,
    author_name text,
    body text NOT NULL,
    cover_image_url text,
    featured_image text,
    read_time text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Policies for public.posts
CREATE POLICY "Allow public read of published posts" ON public.posts
    FOR SELECT USING (status = 'published');

CREATE POLICY "Allow admins full access to posts" ON public.posts
    FOR ALL USING (public.user_role() IN ('head_admin', 'editor'))
    WITH CHECK (public.user_role() IN ('head_admin', 'editor'));

-- -------------------------------------------------------------
-- TABLE: reservations
-- Stores delegate ticket bookings
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reservations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text NOT NULL,
    company text NOT NULL,
    phone text NOT NULL,
    tier text NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    reference text UNIQUE NOT NULL,
    amount numeric NOT NULL,
    currency text NOT NULL DEFAULT 'NGN',
    special_requirements text,
    delegate_count integer NOT NULL DEFAULT 1,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Policies for public.reservations
CREATE POLICY "Allow anyone to insert reservations" ON public.reservations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admins to read, update, delete reservations" ON public.reservations
    FOR ALL USING (public.user_role() IN ('head_admin', 'editor'))
    WITH CHECK (public.user_role() IN ('head_admin', 'editor'));

-- -------------------------------------------------------------
-- TABLE: sponsors
-- Stores sponsor leads and company partnerships
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sponsors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name text NOT NULL,
    industry text NOT NULL,
    website text NOT NULL,
    full_name text NOT NULL,
    designation text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    tier text NOT NULL,
    add_ons text[] DEFAULT '{}'::text[],
    track_count integer NOT NULL DEFAULT 1,
    special_requirements text,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

-- Policies for public.sponsors
CREATE POLICY "Allow anyone to insert sponsor applications" ON public.sponsors
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admins to read, update, delete sponsors" ON public.sponsors
    FOR ALL USING (public.user_role() IN ('head_admin', 'editor'))
    WITH CHECK (public.user_role() IN ('head_admin', 'editor'));

-- -------------------------------------------------------------
-- TABLE: contacts
-- Stores general and logistics inquiries from public form
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contacts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name text NOT NULL,
    email text NOT NULL,
    company text,
    phone text,
    inquiry_type text NOT NULL,
    message text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Policies for public.contacts
CREATE POLICY "Allow anyone to insert contact inquiries" ON public.contacts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admins to read, update, delete contacts" ON public.contacts
    FOR ALL USING (public.user_role() IN ('head_admin', 'editor'))
    WITH CHECK (public.user_role() IN ('head_admin', 'editor'));

-- -------------------------------------------------------------
-- TABLE: audit_logs
-- Stores security logs and admin activity audits
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_email text NOT NULL,
    role text NOT NULL,
    action text NOT NULL,
    target text NOT NULL,
    ip_address text,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for public.audit_logs
CREATE POLICY "Allow admins to insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (public.user_role() IN ('head_admin', 'editor'));

CREATE POLICY "Allow admins to read audit logs" ON public.audit_logs
    FOR SELECT USING (public.user_role() IN ('head_admin', 'editor'));

-- -------------------------------------------------------------
-- TABLE: media_assets
-- Stores uploaded media assets metadata
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.media_assets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name text NOT NULL,
    file_url text NOT NULL,
    storage_path text NOT NULL,
    tags text[] DEFAULT '{}'::text[],
    uploaded_by text NOT NULL,
    file_size text,
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- Policies for public.media_assets
CREATE POLICY "Allow public read of media assets" ON public.media_assets
    FOR SELECT USING (true);

CREATE POLICY "Allow admins full access to media assets" ON public.media_assets
    FOR ALL USING (public.user_role() IN ('head_admin', 'editor'))
    WITH CHECK (public.user_role() IN ('head_admin', 'editor'));

-- -------------------------------------------------------------
-- DEFAULT AND EXPLICIT GRANTS
-- Ensures that API roles have access to tables, sequences, and functions
-- (Row Level Security policies enforce the actual rows visible/modifiable)
-- -------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;
