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
    coalesce(new.raw_app_meta_data->>'role', 'editor'),
    coalesce(new.raw_user_meta_data->>'department', 'Aviation Operations')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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
