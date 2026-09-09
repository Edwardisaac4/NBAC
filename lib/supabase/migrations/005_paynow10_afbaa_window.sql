-- =============================================================
-- MIGRATION: real campaign window for NBAC27-PAYNOW10
-- =============================================================
-- Replaces the 2026-12-31 placeholder from 003 with the actual AfBAA
-- event period: from now until the close of Friday 11 September 2026,
-- the last day of the event.
--
-- Times are Africa/Lagos (WAT, UTC+1) because the deadline is the close
-- of business at the event itself. Written with an explicit +01:00
-- offset rather than a bare timestamp so it cannot be read as UTC and
-- silently cut the promo an hour early.
--
-- NBAC27-EARLY5 is deliberately left on its placeholder in this file —
-- its window is still being confirmed. See the note at the end.
--
-- Safe to run more than once (idempotent UPDATE).
-- Run in the Supabase SQL editor, or via `supabase db push`.
-- =============================================================

-- -------------------------------------------------------------
-- PRECONDITION: 003 (creates discount_codes) and 004 must be applied.
-- -------------------------------------------------------------
DO $do$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'discount_codes'
    ) THEN
        RAISE EXCEPTION
            'public.discount_codes does not exist, so migration 003 has not been applied to THIS project. Apply 003 then 004 before this file.';
    END IF;
END
$do$;

-- Confirmed window: 9 to 11 September 2026 inclusive, Africa/Lagos.
-- valid_from is the start of the 9th rather than now(), so anyone who
-- registered earlier today is still inside the window.
UPDATE public.discount_codes
SET valid_from  = '2026-09-09T00:00:00+01:00'::timestamptz,
    valid_until = '2026-09-11T23:59:59+01:00'::timestamptz,
    active      = true
WHERE code = 'NBAC27-PAYNOW10';

-- -------------------------------------------------------------
-- What this means in practice
--
-- After Friday, typing NBAC27-PAYNOW10 returns codeStatus 'expired' and
-- the registration prices at list. The delegate is told the code has
-- expired rather than being charged silently.
--
-- Delegates who register ON OR BEFORE Friday keep the discounted figure
-- even if they pay the following week: quotePrice locks the price at
-- registration and stamps price_locked_at, and the reservation stays
-- payable for PAYMENT_WINDOW_DAYS (14). This is the point of locking at
-- registration rather than at payment — we hold no Paystack API keys
-- and cannot see when money actually lands, so a coupon that had to be
-- valid on the day of payment would be unenforceable.
-- -------------------------------------------------------------

-- -------------------------------------------------------------
-- STILL OUTSTANDING: NBAC27-EARLY5
--
-- Confirmation expected end of day 9 September 2026. Until then it sits
-- on the placeholder window and remains claimable, which is harmless
-- while PAYNOW10 is the code being circulated at the stand.
--
-- When the period is confirmed:
--
--   UPDATE public.discount_codes
--   SET valid_from  = '<start>'::timestamptz,
--       valid_until = '<end>'::timestamptz
--   WHERE code = 'NBAC27-EARLY5';
--
-- Worth deciding at the same time: PAYNOW10 closes Friday, so if
-- EARLY5's window does not begin immediately afterwards there is a gap
-- in which every delegate pays full list. That may well be intended —
-- but it should be a decision, not a side effect of two separate dates.
-- -------------------------------------------------------------

SELECT code,
       value,
       auto_apply,
       active,
       valid_from,
       valid_until,
       now() BETWEEN valid_from AND coalesce(valid_until, 'infinity') AS in_window
FROM public.discount_codes
ORDER BY code;
