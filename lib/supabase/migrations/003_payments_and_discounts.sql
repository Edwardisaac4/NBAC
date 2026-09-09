-- =============================================================
-- MIGRATION: payment tracking + auditable discount codes
-- =============================================================
-- Context: NBAC collects delegate payments through a shared Paystack
-- payment page owned and managed by EAN finance ("EAN Finance
-- Terminal ($)"). We hold no Paystack API keys, the page carries no
-- reference field, and the amount box is free-entry.
--
-- Consequences this migration exists to handle:
--   * Nothing can ever flip a reservation to "paid" automatically,
--     so payment state has to be an explicit, auditable machine:
--     pending -> initiated -> claimed -> verified.
--   * reservations.amount stored only the final figure, so the gross
--     price and the discount given were unrecoverable. Every price
--     component is now snapshotted at registration.
--   * Discount codes were hardcoded strings in two API routes with
--     divergent behaviour (NBAC27-EARLY5 was issued by /api/interest
--     but silently ignored by /api/register/delegate, so those
--     delegates were quoted 5% off and charged full price). Codes are
--     now rows with real expiry dates.
--
-- Safe to run more than once (IF NOT EXISTS / DROP POLICY IF EXISTS).
-- Run in the Supabase SQL editor, or via `supabase db push`.
-- =============================================================

-- -------------------------------------------------------------
-- PRECONDITION
--
-- This migration ALTERs public.reservations, which is defined in
-- schema.sql, not here. The live project has drifted from schema.sql
-- before (see 001, which existed because three tables were never
-- applied), so fail with an actionable message rather than a bare
-- 42P01 from the first ALTER.
--
-- Correct order for a project that is behind:
--   1. lib/supabase/schema.sql
--   2. migrations/001_restore_missing_tables.sql
--   3. migrations/002_fix_backfill_parsing.sql
--   4. this file
-- -------------------------------------------------------------
DO $do$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'reservations'
    ) THEN
        RAISE EXCEPTION
            'public.reservations does not exist. Apply lib/supabase/schema.sql (then migrations 001 and 002) against THIS project before running 003. If schema.sql has already been applied elsewhere, check you are connected to the right Supabase project.';
    END IF;
END
$do$;

-- -------------------------------------------------------------
-- reservations: payment state + full price snapshot
-- -------------------------------------------------------------
-- pay_token is the unguessable handle used in /pay/<token> URLs.
-- `reference` is human-readable and therefore enumerable
-- (NBAC-2027-VIP- plus a 5-digit random is a ~90k search space), so
-- it must never be the only thing guarding a delegate's name, email
-- and amount. The reference is displayed on the page; the token is
-- what addresses it.
ALTER TABLE public.reservations
    ADD COLUMN IF NOT EXISTS pay_token        text,
    ADD COLUMN IF NOT EXISTS gross_amount     numeric(12,2),
    ADD COLUMN IF NOT EXISTS discount_code    text,
    ADD COLUMN IF NOT EXISTS discount_amount  numeric(12,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS expected_total   numeric(12,2),
    ADD COLUMN IF NOT EXISTS payment_status   text NOT NULL DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS price_locked_at  timestamptz,
    ADD COLUMN IF NOT EXISTS payment_deadline timestamptz,
    ADD COLUMN IF NOT EXISTS initiated_at     timestamptz,
    ADD COLUMN IF NOT EXISTS claimed_at       timestamptz,
    ADD COLUMN IF NOT EXISTS verified_at      timestamptz,
    ADD COLUMN IF NOT EXISTS verified_by      text;

-- Backfill rows written before this migration: the only figure they
-- carry is `amount`, which was already the net payable.
UPDATE public.reservations
SET gross_amount   = COALESCE(gross_amount, amount),
    expected_total = COALESCE(expected_total, amount)
WHERE gross_amount IS NULL OR expected_total IS NULL;

-- expected_total is numeric(12,2) rather than an integer so that a
-- unique-cents scheme (paying $250.37 so the cents identify the
-- invoice) can be switched on later without a migration. Amounts are
-- whole dollars today.
CREATE UNIQUE INDEX IF NOT EXISTS reservations_pay_token_key
    ON public.reservations (pay_token) WHERE pay_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS reservations_payment_status_idx
    ON public.reservations (payment_status);

CREATE INDEX IF NOT EXISTS reservations_discount_code_idx
    ON public.reservations (discount_code) WHERE discount_code IS NOT NULL;

DO $do$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'reservations_payment_status_check'
    ) THEN
        ALTER TABLE public.reservations
            ADD CONSTRAINT reservations_payment_status_check
            CHECK (payment_status IN (
                'pending',          -- registered, no payment attempt seen
                'initiated',        -- clicked through to Paystack
                'claimed',          -- delegate says they paid; unverified
                'amount_mismatch',  -- money arrived, wrong figure
                'verified',         -- confirmed against finance records
                'failed',
                'refunded',
                'waived'            -- comped delegate, nothing to collect
            ));
    END IF;
END
$do$;

-- -------------------------------------------------------------
-- TABLE: discount_codes
-- The definition of a code. Admin-managed, edited over time.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.discount_codes (
    code             text PRIMARY KEY,
    label            text NOT NULL,
    discount_type    text NOT NULL DEFAULT 'percent',
    value            numeric(12,2) NOT NULL,
    currency         text NOT NULL DEFAULT 'USD',
    valid_from       timestamptz NOT NULL DEFAULT now(),
    valid_until      timestamptz,
    max_redemptions  integer,
    max_per_email    integer NOT NULL DEFAULT 1,
    times_redeemed   integer NOT NULL DEFAULT 0,
    applies_to_tiers text[] DEFAULT '{}'::text[],
    min_delegates    integer NOT NULL DEFAULT 1,
    issued_to_email  text,
    campaign         text,
    -- A blanket dated promo: applied to every registration automatically
    -- while it is inside its valid_from/valid_until window, with no code
    -- typed. Replaces the hardcoded `useState('NBAC27-PAYNOW10')` +
    -- `useState(true)` on the registration form, which applied 10% to
    -- everyone forever with no way to expire it. At most one code should
    -- carry this flag at a time.
    auto_apply       boolean NOT NULL DEFAULT false,
    active           boolean NOT NULL DEFAULT true,
    created_by       text,
    created_at       timestamptz DEFAULT now(),
    updated_at       timestamptz DEFAULT now(),
    CONSTRAINT discount_codes_type_check CHECK (discount_type IN ('percent', 'fixed')),
    CONSTRAINT discount_codes_value_check CHECK (value > 0)
);

ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin manage discount_codes" ON public.discount_codes;
CREATE POLICY "Admin manage discount_codes" ON public.discount_codes
    FOR ALL USING (public.user_role() IN ('head_admin', 'editor'))
    WITH CHECK (public.user_role() IN ('head_admin', 'editor'));

-- -------------------------------------------------------------
-- TABLE: discount_redemptions
-- Append-only ledger of coupons actually used.
--
-- Deliberately carries NO foreign key to discount_codes, and
-- snapshots the money columns. Historical discount reporting must
-- never be recomputed from discount_codes: edit a percentage in March
-- and every February figure would silently change.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.discount_redemptions (
    id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code                  text NOT NULL,
    reservation_id        uuid REFERENCES public.reservations(id) ON DELETE CASCADE,
    reservation_reference text NOT NULL,
    email                 text NOT NULL,
    tier                  text,
    delegate_count        integer NOT NULL DEFAULT 1,
    gross_amount          numeric(12,2) NOT NULL,
    discount_amount       numeric(12,2) NOT NULL,
    net_amount            numeric(12,2) NOT NULL,
    currency              text NOT NULL DEFAULT 'USD',
    redeemed_at           timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS discount_redemptions_code_idx
    ON public.discount_redemptions (code);
CREATE INDEX IF NOT EXISTS discount_redemptions_email_idx
    ON public.discount_redemptions (lower(email));

ALTER TABLE public.discount_redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin manage discount_redemptions" ON public.discount_redemptions;
CREATE POLICY "Admin manage discount_redemptions" ON public.discount_redemptions
    FOR ALL USING (public.user_role() IN ('head_admin', 'editor'))
    WITH CHECK (public.user_role() IN ('head_admin', 'editor'));

-- -------------------------------------------------------------
-- TABLE: payments
-- Money actually received. Many-to-one against a reservation so
-- part-payments and corporate top-ups are first-class, and
-- channel-agnostic so bank transfers sit in the same book as cards.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
    id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id        uuid REFERENCES public.reservations(id) ON DELETE SET NULL,
    reservation_reference text,
    channel               text NOT NULL DEFAULT 'paystack_link',
    provider_reference    text,
    payer_email           text,
    payer_name            text,
    amount                numeric(12,2) NOT NULL,
    currency              text NOT NULL DEFAULT 'USD',
    fees                  numeric(12,2),
    status                text NOT NULL DEFAULT 'claimed',
    paid_at               timestamptz,
    evidence_url          text,
    note                  text,
    source                text NOT NULL DEFAULT 'delegate_self_report',
    verified_by           text,
    verified_at           timestamptz,
    raw_payload           jsonb,
    created_at            timestamptz DEFAULT now(),
    CONSTRAINT payments_channel_check CHECK (channel IN (
        'paystack_link', 'paystack_inline', 'bank_transfer', 'cash', 'comp'
    )),
    CONSTRAINT payments_status_check CHECK (status IN ('claimed', 'verified', 'rejected'))
);

-- The single most important constraint here. Reconciliation imports
-- the same finance export more than once as a matter of course, so a
-- provider reference must never be able to land twice. Partial and
-- lower()ed because self-reported references arrive in mixed case and
-- bank transfers have none at all.
CREATE UNIQUE INDEX IF NOT EXISTS payments_provider_reference_key
    ON public.payments (lower(provider_reference))
    WHERE provider_reference IS NOT NULL;

CREATE INDEX IF NOT EXISTS payments_reservation_idx ON public.payments (reservation_id);
CREATE INDEX IF NOT EXISTS payments_status_idx ON public.payments (status);
CREATE INDEX IF NOT EXISTS payments_payer_email_idx ON public.payments (lower(payer_email));

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin manage payments" ON public.payments;
CREATE POLICY "Admin manage payments" ON public.payments
    FOR ALL USING (public.user_role() IN ('head_admin', 'editor'))
    WITH CHECK (public.user_role() IN ('head_admin', 'editor'));

-- -------------------------------------------------------------
-- GRANTS
--
-- schema.sql ends with a blanket `GRANT SELECT ON ALL TABLES ... TO
-- anon` plus an ALTER DEFAULT PRIVILEGES that extends SELECT to every
-- future table. RLS is what actually gates the rows, but these three
-- tables hold payer emails, amounts and the discount ledger, so the
-- grant is revoked explicitly rather than left to policy alone.
-- Nothing here is ever read from the browser: /pay/<token> and the
-- admin screens go through server routes using the service role.
-- -------------------------------------------------------------
REVOKE ALL ON public.discount_codes FROM anon;
REVOKE ALL ON public.discount_redemptions FROM anon;
REVOKE ALL ON public.payments FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.discount_codes TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.discount_redemptions TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated, service_role;

-- -------------------------------------------------------------
-- SEED: the two codes already in circulation
--
-- /api/interest has been handing these out since the AfBAA stand.
-- PAYNOW10 was honoured by the delegate route; EARLY5 was not.
--
-- >>> THE valid_until DATES BELOW ARE PLACEHOLDERS. <<<
-- The public copy promises "active for the AfBAA event period"
-- (PAYNOW10) and "valid for 30 days from event closing" (EARLY5).
-- Set the real dates before going live -- expiry is enforced from
-- these rows now, not from marketing copy.
-- -------------------------------------------------------------
-- Both codes are typed by the delegate — neither is auto-applied. The
-- registration form previously gave every delegate 10% off with no code, via
-- `useState('NBAC27-PAYNOW10')` + `useState(true)`; that is deliberately not
-- carried forward (see 004, which also fixes projects seeded before this
-- change). They do not stack, and no best-value substitution is applied:
-- whichever code is typed is the one that applies.
--
-- max_per_email is 0 on PAYNOW10 to mean "no per-email cap", since it was
-- circulated broadly at the AfBAA stand rather than issued to one named lead.
INSERT INTO public.discount_codes
    (code, label, discount_type, value, valid_from, valid_until, campaign,
     max_per_email, applies_to_tiers, auto_apply)
VALUES
    ('NBAC27-PAYNOW10', 'AfBAA Event Full Payment Discount', 'percent', 10,
     '2026-01-01T00:00:00Z', '2026-12-31T23:59:59Z', 'afbaa_stand', 0, '{}'::text[], false),
    ('NBAC27-EARLY5',   'Early Bird Discount',               'percent',  5,
     '2026-01-01T00:00:00Z', '2026-12-31T23:59:59Z', 'early_bird',  1, '{}'::text[], false)
ON CONFLICT (code) DO NOTHING;

-- Only one blanket promo may run at a time, or the form cannot tell the
-- delegate which discount they are getting.
CREATE UNIQUE INDEX IF NOT EXISTS discount_codes_single_auto_apply
    ON public.discount_codes ((auto_apply)) WHERE auto_apply;

-- -------------------------------------------------------------
-- updated_at maintenance for discount_codes
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.touch_discount_code()
RETURNS trigger AS $fn$
BEGIN
  new.updated_at := now();
  RETURN new;
END;
$fn$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS tr_discount_codes_touch ON public.discount_codes;
CREATE TRIGGER tr_discount_codes_touch
  BEFORE UPDATE ON public.discount_codes
  FOR EACH ROW EXECUTE FUNCTION public.touch_discount_code();

-- -------------------------------------------------------------
-- Atomic redemption counter.
--
-- times_redeemed is a convenience counter for the admin UI; the
-- ledger in discount_redemptions is the reporting source of truth.
-- It is still incremented in-statement so two simultaneous
-- registrations on the same code cannot lose a count via
-- read-modify-write.
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_discount_redemption(target_code text)
RETURNS void AS $fn$
  UPDATE public.discount_codes
  SET times_redeemed = times_redeemed + 1
  WHERE code = target_code;
$fn$ LANGUAGE sql SECURITY DEFINER SET search_path = '';

REVOKE ALL ON FUNCTION public.increment_discount_redemption(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.increment_discount_redemption(text) TO service_role, authenticated;

-- -------------------------------------------------------------
-- Notify admins when a delegate self-reports a payment, so the
-- verification queue does not depend on somebody remembering to look.
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.on_payment_claimed()
RETURNS trigger AS $fn$
BEGIN
  IF new.status = 'claimed' THEN
    INSERT INTO public.notifications (title, message, type)
    VALUES (
      'Payment Awaiting Verification',
      coalesce(new.payer_email, 'A delegate') || ' reported paying ' ||
      to_char(new.amount, 'FM999999990.00') || ' ' || new.currency ||
      ' for ' || coalesce(new.reservation_reference, 'an unknown reference') || '.',
      'payment_claim'
    );
  END IF;
  RETURN new;
END;
$fn$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS tr_payment_claimed ON public.payments;
CREATE TRIGGER tr_payment_claimed
  AFTER INSERT ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.on_payment_claimed();
