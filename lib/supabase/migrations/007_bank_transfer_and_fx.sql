-- 007: Bank transfer payment channel + USD->NGN conversion.
--
-- EAN's Paystack terminal rejects cards, so delegates now pay by bank
-- transfer into an NBAC-dedicated GTB account (USD via a Citibank New York
-- correspondent, or NGN directly). Two consequences shape this migration.
--
--   1. A bank transfer carries a NARRATION the payer types themselves. That
--      is the reference field the Paystack terminal never had, so matching a
--      credit to a delegate stops being guesswork. Nothing schema-side is
--      needed for it — reservations.reference is already what we ask them to
--      quote — but it is the reason self-reporting can stay optional.
--
--   2. Delegates paying locally want a naira figure. The rate has to be
--      LOCKED per reservation the same way the discount is: a delegate who
--      registers today and transfers in nine days must owe the figure they
--      were shown, not whatever the rate has drifted to.
--
-- The rate deliberately lives in a table, not in a live API call. Fetching
-- mid-payment makes a third-party outage break checkout, and the figure
-- finance actually converts at is a business decision, not a market quote.

DO $do$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'reservations') THEN
        RAISE EXCEPTION 'public.reservations does not exist. Apply lib/supabase/schema.sql, then migrations 001-006, against THIS project before running 007.';
    END IF;
END
$do$;

-- -------------------------------------------------------------
-- TABLE: fx_rates
--
-- One row per quote currency. Hand-maintained: finance says what they
-- convert at, someone updates the row. `source` and `updated_at` exist
-- so a stale rate is visible rather than silently wrong — in this
-- market a month-old rate is real money.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fx_rates (
    quote_currency text PRIMARY KEY,
    base_currency  text NOT NULL DEFAULT 'USD',
    rate           numeric(18,6) NOT NULL,
    source         text,
    note           text,
    updated_at     timestamptz NOT NULL DEFAULT now(),
    updated_by     text,
    CONSTRAINT fx_rates_rate_positive CHECK (rate > 0)
);

ALTER TABLE public.fx_rates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin manage fx rates" ON public.fx_rates;
CREATE POLICY "Admin manage fx rates" ON public.fx_rates
    FOR ALL USING (public.user_role() IN ('head_admin', 'editor'))
    WITH CHECK (public.user_role() IN ('head_admin', 'editor'));

-- schema.sql grants anon SELECT on all tables, present and future. The rate
-- itself is not a secret, but nothing reads it from the browser: the pay page
-- is server-rendered through the service role.
REVOKE ALL ON public.fx_rates FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fx_rates TO authenticated, service_role;

-- Seeded with the market rate on 21 Sep 2026. Replace with finance's own
-- figure as soon as they give you one — theirs is the one money converts at.
INSERT INTO public.fx_rates (quote_currency, base_currency, rate, source, note, updated_by)
VALUES ('NGN', 'USD', 1332.834401, 'open.er-api.com 2026-09-21',
        'Market reference rate. Awaiting finance''s own conversion rate.', 'migration_007')
ON CONFLICT (quote_currency) DO NOTHING;

-- -------------------------------------------------------------
-- reservations: lock the rate alongside the price
-- -------------------------------------------------------------
ALTER TABLE public.reservations
    ADD COLUMN IF NOT EXISTS fx_rate            numeric(18,6),
    ADD COLUMN IF NOT EXISTS expected_total_ngn numeric(14,2),
    ADD COLUMN IF NOT EXISTS paid_currency      text;

COMMENT ON COLUMN public.reservations.fx_rate IS
    'USD->NGN rate locked at registration. Null for rows predating 007.';
COMMENT ON COLUMN public.reservations.expected_total_ngn IS
    'expected_total converted at fx_rate and rounded UP to the next whole naira.';
COMMENT ON COLUMN public.reservations.paid_currency IS
    'Which account the delegate says they used: USD or NGN. Set on confirm.';

ALTER TABLE public.reservations
    DROP CONSTRAINT IF EXISTS reservations_paid_currency_check;
ALTER TABLE public.reservations
    ADD CONSTRAINT reservations_paid_currency_check
    CHECK (paid_currency IS NULL OR paid_currency IN ('USD', 'NGN'));

-- Backfill so existing rows show a naira figure too. Uses the seeded rate;
-- these delegates were quoted in USD and that figure is unchanged.
UPDATE public.reservations r
SET fx_rate = f.rate,
    expected_total_ngn = ceil(COALESCE(r.expected_total, r.amount) * f.rate)
FROM public.fx_rates f
WHERE f.quote_currency = 'NGN'
  AND r.fx_rate IS NULL;

-- -------------------------------------------------------------
-- payments: bank_transfer is already an allowed channel (003), but
-- the status trigger and reference index assumed a provider reference
-- always exists. A local NGN transfer often has none, which the
-- partial unique index already tolerates. Nothing to change.
--
-- What IS needed: the narration the payer typed, when we can capture
-- it, kept distinct from provider_reference (a bank's own txn id).
-- -------------------------------------------------------------
ALTER TABLE public.payments
    ADD COLUMN IF NOT EXISTS payer_narration text,
    ADD COLUMN IF NOT EXISTS bank_account    text;

COMMENT ON COLUMN public.payments.payer_narration IS
    'Narration/description the payer typed on the transfer, if reported.';
COMMENT ON COLUMN public.payments.bank_account IS
    'Which NBAC account received it: USD or NGN. Free text for imports.';

-- Verify the migration did what it claims before anything depends on it.
DO $do$
DECLARE
    rate_count int;
    unlocked   int;
BEGIN
    SELECT count(*) INTO rate_count FROM public.fx_rates WHERE quote_currency = 'NGN';
    IF rate_count <> 1 THEN
        RAISE EXCEPTION 'Expected exactly 1 NGN rate row, found %.', rate_count;
    END IF;

    SELECT count(*) INTO unlocked FROM public.reservations WHERE fx_rate IS NULL;
    IF unlocked > 0 THEN
        RAISE EXCEPTION '% reservation(s) still have no fx_rate after backfill.', unlocked;
    END IF;
END
$do$;
