-- =============================================================
-- MIGRATION: discount codes are typed, never auto-applied
-- =============================================================
-- Decision: every delegate enters their own code. No blanket promo is
-- applied silently to registrations that present no code.
--
-- Why this is a migration rather than an edit to 003's seed: 003 has
-- already been applied, and its INSERT ends in ON CONFLICT (code) DO
-- NOTHING. Editing that INSERT therefore changes nothing on a project
-- where it has already run — only a fresh project would pick it up.
-- 003's seed is updated to match for new projects; this file fixes the
-- row that already exists.
--
-- Discount VALUES are deliberately untouched: PAYNOW10 stays 10% and
-- EARLY5 stays 5%. They do not stack, and no best-value substitution is
-- applied — whichever code the delegate types is the one they get.
--
-- Safe to run more than once (idempotent UPDATE).
-- Run in the Supabase SQL editor, or via `supabase db push`.
-- =============================================================

-- -------------------------------------------------------------
-- PRECONDITION
--
-- discount_codes is created by 003, not here. The Supabase SQL editor
-- runs a multi-statement script inside one implicit transaction, so a
-- single failing statement anywhere in 003 rolls the entire migration
-- back — leaving no trace of it and making a failed run easy to mistake
-- for a successful one. Check explicitly.
-- -------------------------------------------------------------
DO $do$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'discount_codes'
    ) THEN
        RAISE EXCEPTION
            'public.discount_codes does not exist, so migration 003 has not been applied to THIS project. Run migrations/003_payments_and_discounts.sql first and check its output for an error — the SQL editor rolls the whole script back on any failure, so a partial run leaves nothing behind.';
    END IF;
END
$do$;

-- -------------------------------------------------------------
-- Turn off the blanket promo.
--
-- NBAC27-PAYNOW10 was seeded with auto_apply = true to preserve the
-- registration form's previous behaviour, where
-- `useState('NBAC27-PAYNOW10')` + `useState(true)` gave every delegate
-- 10% off without a code. That is now switched off: the discount still
-- exists at 10%, but it has to be typed.
--
-- Side effect this removes: while a blanket promo ran, typing a valid
-- NBAC27-EARLY5 (5%) charged MORE than typing nothing at all (10%), so
-- delegates were penalised for using the code they were issued.
-- -------------------------------------------------------------
UPDATE public.discount_codes
SET auto_apply = false
WHERE auto_apply;

-- -------------------------------------------------------------
-- The auto_apply column, its unique index, and the promo-fallback
-- branch in lib/pricing.ts are all retained deliberately, dormant.
--
-- A bi-annual conference will very likely run a blanket campaign again
-- (a launch window, a post-AfBAA push). Setting auto_apply = true on one
-- row is then the only change needed, and the fairness logic that stops
-- a typed code costing more than no code is already in place. Removing
-- the machinery now and rebuilding it later would be the worse trade.
--
-- With no row carrying the flag, getAutoApplyPromo() returns null and
-- every quote prices at list unless a code is typed.
-- -------------------------------------------------------------

-- -------------------------------------------------------------
-- REMINDER: both codes still carry placeholder expiry dates.
--
-- Both are dated promos that should lapse after their campaign period.
-- Set the real windows when confirmed — expiry is enforced from these
-- rows, so a placeholder date is the only thing keeping them alive:
--
--   UPDATE public.discount_codes
--   SET valid_from  = '<start>'::timestamptz,
--       valid_until = '<end>'::timestamptz
--   WHERE code = 'NBAC27-PAYNOW10';
--
-- Tier prices are separate and live in public.ticket_tiers, editable
-- from /admin/tickets without a deploy. Note that reservations snapshot
-- their price at registration (price_locked_at), so repricing a tier
-- never retroactively alters a booking already taken.
-- -------------------------------------------------------------

SELECT code, value, auto_apply, active, valid_from, valid_until
FROM public.discount_codes
ORDER BY code;
