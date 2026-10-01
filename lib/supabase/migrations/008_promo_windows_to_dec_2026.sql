-- 008: Extend both promo windows to 31 Dec 2026, and drop "AfBAA" from the
-- PAYNOW10 label.
--
-- Migration 006 ran both codes 21 Sep - 21 Oct 2026. They now run to the
-- close of 31 Dec 2026 in Africa/Lagos time, with an explicit +01:00 offset
-- for the same reason as 005 and 006: a naive timestamp would be read as UTC
-- and end the promo an hour early.
--
-- valid_from is deliberately untouched, so the windows still open where 006
-- put them. Discount values and max_redemptions are untouched too: this
-- extends the dates, it does not change what the codes are worth.
--
-- The PAYNOW10 label was seeded in 003 as "AfBAA Event Full Payment
-- Discount". The label is not internal: the coupon email and the delegate
-- registration form both print it, so it is renamed here now that the
-- campaign is no longer tied to the AfBAA event. The campaign key
-- ('afbaa_stand') is left alone because nothing displays it and reporting
-- may group on it.

DO $do$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'discount_codes') THEN
        RAISE EXCEPTION 'public.discount_codes does not exist. Apply lib/supabase/schema.sql, then migrations 001-007, against THIS project before running 008.';
    END IF;
END
$do$;

UPDATE public.discount_codes
SET valid_until = '2026-12-31T23:59:59+01:00'::timestamptz,
    active      = true
WHERE code IN ('NBAC27-PAYNOW10', 'NBAC27-EARLY5');

UPDATE public.discount_codes
SET label = 'Full Payment Discount'
WHERE code = 'NBAC27-PAYNOW10';

-- Both codes must exist and must have been updated; a silent zero-row UPDATE
-- here would leave a campaign expiring on the old date.
DO $do$
DECLARE
    updated int;
BEGIN
    SELECT count(*) INTO updated
    FROM public.discount_codes
    WHERE code IN ('NBAC27-PAYNOW10', 'NBAC27-EARLY5')
      AND valid_until = '2026-12-31T23:59:59+01:00'::timestamptz
      AND active
      AND label NOT ILIKE '%afbaa%';

    IF updated <> 2 THEN
        RAISE EXCEPTION 'Expected 2 promo codes updated, got %. Check the code values in public.discount_codes.', updated;
    END IF;
END
$do$;

SELECT code,
       label,
       value,
       active,
       valid_from,
       valid_until,
       now() BETWEEN valid_from AND coalesce(valid_until, 'infinity') AS in_window
FROM public.discount_codes
WHERE code IN ('NBAC27-PAYNOW10', 'NBAC27-EARLY5')
ORDER BY code;
