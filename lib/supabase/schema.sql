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
$$ LANGUAGE sql STABLE SECURITY INVOKER
   SET search_path = '';

-- -------------------------------------------------------------
-- TABLE: posts
-- Stores articles, press releases, and announcements
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.posts (
    id text PRIMARY KEY,
    title text NOT NULL,
    slug text,
    type text NOT NULL,
    status text NOT NULL,
    author_id text,
    author text,
    author_name text,
    body text NOT NULL,
    cover_image_url text,
    featured_image text,
    read_time text,
    meta_title text,
    meta_description text,
    focus_keyword text,
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

-- Auto-generate slug index for fast lookups
CREATE INDEX IF NOT EXISTS posts_slug_idx ON public.posts (slug) WHERE status = 'published';

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
    currency text NOT NULL DEFAULT 'USD',
    special_requirements text,
    delegate_count integer NOT NULL DEFAULT 1,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Policies for public.reservations
CREATE POLICY "Allow anon to insert reservations" ON public.reservations
    FOR INSERT TO anon WITH CHECK (true);

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
CREATE POLICY "Allow anon to insert sponsor applications" ON public.sponsors
    FOR INSERT TO anon WITH CHECK (true);

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
CREATE POLICY "Allow anon to insert contact inquiries" ON public.contacts
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow admins to read, update, delete contacts" ON public.contacts
    FOR ALL USING (public.user_role() IN ('head_admin', 'editor'))
    WITH CHECK (public.user_role() IN ('head_admin', 'editor'));

-- -------------------------------------------------------------
-- TABLE: profiles
-- Stores non-sensitive user metadata like department and full name
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL,
    full_name text,
    job_title text,
    role text,
    department text,
    avatar_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for public.profiles
CREATE POLICY "Allow users to read their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow admins to read all profiles" ON public.profiles
    FOR SELECT USING (public.user_role() IN ('head_admin', 'editor'));

-- Profile creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, department)
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_app_meta_data->>'role', 'viewer'),
    coalesce(new.raw_user_meta_data->>'department', 'Aviation Operations')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to prevent self-service modification of privileged columns
CREATE OR REPLACE FUNCTION public.protect_profile_columns()
RETURNS trigger AS $$
BEGIN
  IF new.role IS DISTINCT FROM old.role THEN
    new.role := old.role;
  END IF;
  IF new.email IS DISTINCT FROM old.email THEN
    new.email := old.email;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE TRIGGER protect_profiles_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_columns();

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
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admins full access to media assets" ON public.media_assets
    FOR ALL USING (public.user_role() IN ('head_admin', 'editor'))
    WITH CHECK (public.user_role() IN ('head_admin', 'editor'));

-- -------------------------------------------------------------
-- VIEW: public_media_assets
-- Exposes media assets metadata without sensitive uploader info
-- -------------------------------------------------------------
CREATE OR REPLACE VIEW public.public_media_assets AS
    SELECT id, file_name, file_url, storage_path, tags, file_size, sort_order, created_at
    FROM public.media_assets;

-- -------------------------------------------------------------
-- DEFAULT AND EXPLICIT GRANTS
-- Ensures that API roles have access to tables, sequences, and functions
-- (Row Level Security policies enforce the actual rows visible/modifiable)
-- -------------------------------------------------------------
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated, service_role;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated, service_role;

-- Explicitly grant INSERT to anon for public submission tables (since anon only gets SELECT by default)
GRANT INSERT ON public.reservations TO anon;
GRANT INSERT ON public.sponsors TO anon;
GRANT INSERT ON public.contacts TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated, service_role;

-- -------------------------------------------------------------
-- TABLE: notifications
-- Stores notification items for admin dashboard
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL,
    read boolean NOT NULL DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies for public.notifications
CREATE POLICY "Allow admins to read notifications" ON public.notifications
    FOR SELECT USING (public.user_role() IN ('head_admin', 'editor'));

CREATE POLICY "Allow admins to update notifications" ON public.notifications
    FOR UPDATE USING (public.user_role() IN ('head_admin', 'editor'))
    WITH CHECK (public.user_role() IN ('head_admin', 'editor'));

CREATE POLICY "Allow admins to delete notifications" ON public.notifications
    FOR DELETE USING (public.user_role() IN ('head_admin', 'editor'));

-- Triggers to automatically create notifications
CREATE OR REPLACE FUNCTION public.on_reservation_inserted()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.notifications (title, message, type)
  VALUES (
    'New Ticket Registration',
    coalesce(new.name, 'Someone') || ' registered as ' || coalesce(new.tier, 'delegate') || ' (' || coalesce(new.delegate_count, 1) || ' seat(s)).',
    'delegate_registration'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE TRIGGER tr_reservation_inserted
  AFTER INSERT ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.on_reservation_inserted();

CREATE OR REPLACE FUNCTION public.on_sponsor_inserted()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.notifications (title, message, type)
  VALUES (
    'New Sponsor Application',
    coalesce(new.company_name, 'A company') || ' applied for ' || coalesce(new.tier, 'sponsor') || ' tier sponsorship.',
    'sponsor_application'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE TRIGGER tr_sponsor_inserted
  AFTER INSERT ON public.sponsors
  FOR EACH ROW EXECUTE FUNCTION public.on_sponsor_inserted();

CREATE OR REPLACE FUNCTION public.on_contact_inserted()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.notifications (title, message, type)
  VALUES (
    'New Contact Inquiry',
    coalesce(new.full_name, 'Someone') || ' sent an inquiry: "' || substring(coalesce(new.message, ''), 1, 60) || '..."',
    'contact_inquiry'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE TRIGGER tr_contact_inserted
  AFTER INSERT ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.on_contact_inserted();

GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, UPDATE, DELETE ON TABLES TO authenticated, service_role;

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
-- TABLE: ticket_tiers
-- Dynamic delegate pass / ticket configuration (managed from Admin)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ticket_tiers (
    id text PRIMARY KEY,
    name text NOT NULL,
    badge text,
    price numeric NOT NULL,
    currency text NOT NULL DEFAULT 'USD',
    description text,
    privileges text[] DEFAULT '{}'::text[],
    billing_model text NOT NULL DEFAULT 'per_delegate',
    included_delegates integer NOT NULL DEFAULT 1,
    availability text NOT NULL DEFAULT 'available',
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.ticket_tiers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read ticket_tiers" ON public.ticket_tiers;
CREATE POLICY "Public read ticket_tiers" ON public.ticket_tiers
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage ticket_tiers" ON public.ticket_tiers;
CREATE POLICY "Admin manage ticket_tiers" ON public.ticket_tiers
    FOR ALL USING (public.user_role() IN ('head_admin', 'editor'))
    WITH CHECK (public.user_role() IN ('head_admin', 'editor'));

GRANT SELECT ON public.ticket_tiers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ticket_tiers TO authenticated, service_role;

-- -------------------------------------------------------------
-- TABLE: sponsor_tiers_db
-- Dynamic sponsorship package configuration (managed from Admin)
-- Uses _db suffix to avoid collision with constants.ts SPONSOR_TIERS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sponsor_tiers_db (
    id text PRIMARY KEY,
    name text NOT NULL,
    price numeric NOT NULL,
    currency text NOT NULL DEFAULT 'USD',
    badge text,
    description text NOT NULL,
    branding_privileges text[] DEFAULT '{}'::text[],
    speaking_privileges text[] DEFAULT '{}'::text[],
    digital_privileges text[] DEFAULT '{}'::text[],
    availability text NOT NULL DEFAULT 'available',
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.sponsor_tiers_db ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read sponsor_tiers_db" ON public.sponsor_tiers_db;
CREATE POLICY "Public read sponsor_tiers_db" ON public.sponsor_tiers_db
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage sponsor_tiers_db" ON public.sponsor_tiers_db;
CREATE POLICY "Admin manage sponsor_tiers_db" ON public.sponsor_tiers_db
    FOR ALL USING (public.user_role() IN ('head_admin', 'editor'))
    WITH CHECK (public.user_role() IN ('head_admin', 'editor'));

GRANT SELECT ON public.sponsor_tiers_db TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sponsor_tiers_db TO authenticated, service_role;

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
