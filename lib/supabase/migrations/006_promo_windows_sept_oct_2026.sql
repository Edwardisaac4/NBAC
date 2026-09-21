-- 006: Reset both promo windows to a one-month run from 21 Sep 2026.
--
-- PAYNOW10 was scoped to the three AfBAA event days (9-11 Sep 2026, set in
-- migration 005) and had therefore expired. EARLY5 was still carrying the
-- 31 Dec 2026 placeholder that was never confirmed.
--
-- Both now run 21 Sep - 21 Oct 2026 inclusive, in Africa/Lagos time, which is
-- the timezone the campaign is communicated in. Times are explicit +01:00
-- rather than naive so the window does not shift by an hour depending on the
-- server's own timezone.
--
-- "One month" here is a validity window, not a redemption cap:
-- max_redemptions is deliberately left untouched.

DO $do$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'discount_codes') THEN
        RAISE EXCEPTION 'public.discount_codes does not exist. Apply lib/supabase/schema.sql, then migrations 001-005, against THIS project before running 006.';
    END IF;
END
$do$;

UPDATE public.discount_codes
SET valid_from  = '2026-09-21T00:00:00+01:00'::timestamptz,
    valid_until = '2026-10-21T23:59:59+01:00'::timestamptz,
    active      = true
WHERE code IN ('NBAC27-PAYNOW10', 'NBAC27-EARLY5');

-- Both codes must exist and must have been updated; a silent zero-row UPDATE
-- here would leave a campaign live with the wrong dates.
DO $do$
DECLARE
    updated int;
BEGIN
    SELECT count(*) INTO updated
    FROM public.discount_codes
    WHERE code IN ('NBAC27-PAYNOW10', 'NBAC27-EARLY5')
      AND valid_from  = '2026-09-21T00:00:00+01:00'::timestamptz
      AND valid_until = '2026-10-21T23:59:59+01:00'::timestamptz
      AND active;

    IF updated <> 2 THEN
        RAISE EXCEPTION 'Expected 2 promo codes updated, got %. Check the code values in public.discount_codes.', updated;
    END IF;
END
$do$;
