-- =============================================================
-- MIGRATION 012: Title Partner and revised sponsorship packages
-- =============================================================
-- Title Partner returns as the top tier ($40,000, one only). Prices and
-- benefits for every tier follow the revised sponsorship table; Silver
-- moves from $10,000 to $12,500. Each badge now shows the tier's
-- availability ("One only", "Three available", ...). Description and
-- availability are left as set in admin, except on the new Title row.
--
-- The partner wall gains a Title tier, so the partners.tier check is
-- widened to allow 'title'. Run after migration 011.
--
-- The *_privileges columns are jsonb in the live database (see migration
-- 010), so each list is built with jsonb_build_array.
--
-- Keep in sync with SPONSOR_TIERS in lib/constants.ts.
--
-- Safe to run more than once.
-- =============================================================

BEGIN;

INSERT INTO public.sponsor_tiers_db (
    id, name, price, currency, badge, description,
    branding_privileges, speaking_privileges, digital_privileges,
    availability, sort_order
) VALUES (
    'title',
    'Title Partner',
    40000,
    'USD',
    'One only',
    'The exclusive title partner. NBAC 2027 is presented in partnership with you, from the opening ceremony to the final session.',
    jsonb_build_array(
        'Conference named "in partnership with" you',
        'Opening ceremony host',
        'Branding on the main stage and in all areas',
        'Branded lounge',
        'Logo on delegate bags and lanyards',
        'Logo on conference materials'
    ),
    jsonb_build_array(
        'Opening keynote',
        'Panel seat',
        'One sponsored session'
    ),
    jsonb_build_array(
        '10 fully hosted passes (both days + Gala)',
        'Logo on every page of the NBAC website',
        '8 social media posts',
        'Named in all delegate communications',
        'Named in every press release',
        'Joint media briefing with EAN',
        'First right of refusal for Title Partner at NBAC 2028'
    ),
    'limited',
    0
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    badge = EXCLUDED.badge,
    branding_privileges = EXCLUDED.branding_privileges,
    speaking_privileges = EXCLUDED.speaking_privileges,
    digital_privileges = EXCLUDED.digital_privileges,
    sort_order = EXCLUDED.sort_order,
    updated_at = now();

UPDATE public.sponsor_tiers_db SET
    name = 'Platinum Sponsor',
    price = 25000,
    badge = 'Three available',
    sort_order = 1,
    branding_privileges = jsonb_build_array(
        'Gala Dinner host: An Evening of Aviators',
        'Recognition: "Platinum partner"',
        'Branding in welcome, registration and networking areas',
        'Branded lounge',
        'Logo on delegate bags',
        'Branded items in delegate bags',
        'Logo on conference materials'
    ),
    speaking_privileges = jsonb_build_array(
        'Keynote address',
        'Panel seat',
        'One sponsored session'
    ),
    digital_privileges = jsonb_build_array(
        '8 fully hosted passes (both days + Gala)',
        'Logo on NBAC website',
        '6 social media posts',
        'Named in all delegate communications',
        'Media outreach, with interviews arranged with trade press',
        'First right of refusal for Platinum sponsorship at NBAC 2028'
    ),
    updated_at = now()
WHERE id = 'platinum';

UPDATE public.sponsor_tiers_db SET
    name = 'Gold Sponsor',
    price = 20000,
    badge = 'Four available',
    sort_order = 2,
    branding_privileges = jsonb_build_array(
        'Sponsorship, with visible branding, of one luncheon or coffee break',
        'Recognition: "Gold partner"',
        'Branding in welcome, registration and networking areas',
        'Logo on delegate bags',
        'Logo on conference materials'
    ),
    speaking_privileges = jsonb_build_array(
        'Panel seat'
    ),
    digital_privileges = jsonb_build_array(
        '6 fully hosted passes (both days + Gala)',
        'Logo on NBAC website',
        '4 social media posts',
        'Named in all delegate communications'
    ),
    updated_at = now()
WHERE id = 'gold';

UPDATE public.sponsor_tiers_db SET
    name = 'Silver Sponsor',
    price = 12500,
    badge = 'Six available',
    sort_order = 3,
    branding_privileges = jsonb_build_array(
        'Sponsorship of Speed Networking Session',
        'Recognition: "Sponsored by..."',
        'Branding in registration zone',
        'Logo on conference materials'
    ),
    speaking_privileges = '[]'::jsonb,
    digital_privileges = jsonb_build_array(
        '4 fully hosted passes (both days + Gala)',
        'Logo on NBAC website',
        '2 social media posts'
    ),
    updated_at = now()
WHERE id = 'silver';

UPDATE public.sponsor_tiers_db SET
    name = 'Bronze Sponsor',
    price = 5000,
    badge = 'Open',
    sort_order = 4,
    branding_privileges = jsonb_build_array(
        'Recognition: "Supported by..."',
        'Logo on the on-site logo wall',
        'Logo on conference materials'
    ),
    speaking_privileges = '[]'::jsonb,
    digital_privileges = jsonb_build_array(
        '2 fully hosted passes (both days + Gala)',
        'Logo on NBAC website',
        '1 social media post'
    ),
    updated_at = now()
WHERE id = 'bronze';

-- All five tiers must exist; a silent zero-row UPDATE would leave a tier
-- showing its old benefits.
DO $do$
BEGIN
    IF (SELECT count(*) FROM public.sponsor_tiers_db
        WHERE id IN ('title', 'platinum', 'gold', 'silver', 'bronze')) <> 5 THEN
        RAISE EXCEPTION 'Expected title, platinum, gold, silver and bronze rows in sponsor_tiers_db.';
    END IF;
END
$do$;

-- Partner wall: allow Title Partner logos.
ALTER TABLE IF EXISTS public.partners DROP CONSTRAINT IF EXISTS partners_tier_check;
ALTER TABLE IF EXISTS public.partners ADD CONSTRAINT partners_tier_check
    CHECK (tier IN ('title', 'platinum', 'gold', 'silver', 'bronze'));

COMMIT;
