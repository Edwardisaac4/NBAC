-- =============================================================
-- MIGRATION 010: 2027 sponsorship packages
-- =============================================================
-- Title Sponsor is withdrawn; Platinum is now the top tier. Prices and
-- benefits follow the revised sponsorship table. Badge, description and
-- availability are left as set in admin.
--
-- The *_privileges columns are jsonb in the live database (schema.sql
-- describes them as text[], which is out of date), so each list is built
-- with jsonb_build_array.
--
-- The public site and /admin/sponsors-manager both read sponsor_tiers_db,
-- so this is what makes the change visible on both.
--
-- Safe to run more than once.
-- =============================================================

BEGIN;

DELETE FROM public.sponsor_tiers_db WHERE id = 'title';

UPDATE public.sponsor_tiers_db SET
    name = 'Platinum Sponsor',
    price = 25000,
    sort_order = 0,
    branding_privileges = jsonb_build_array(
        'Sponsor of Gala Dinner',
        'Branding visible at Gala Dinner',
        'Partnership branding: "In partnership with..."',
        'Visible branding in welcome area, registration zone, exhibition zone',
        'Sponsorship of one panel or speech',
        'Logo on delegate bags',
        'Branded items in delegate bags',
        'Logo on various conference materials'
    ),
    speaking_privileges = jsonb_build_array(
        'Keynote address',
        'Panel speaking opportunity'
    ),
    digital_privileges = jsonb_build_array(
        '5 fully hosted passes (both days + Gala)',
        'Logo on NBAC website',
        'Named in all delegate communications',
        'Mentioned in media outreach',
        '6 social media posts',
        'First right of refusal for Platinum sponsorship at NBAC 2028'
    ),
    updated_at = now()
WHERE id = 'platinum';

UPDATE public.sponsor_tiers_db SET
    name = 'Gold Sponsor',
    price = 20000,
    sort_order = 1,
    branding_privileges = jsonb_build_array(
        'Sponsorship, with visible branding, of one luncheon, breakfast or coffee break',
        'Sponsor branding: "In collaboration with..."',
        'Visible branding in welcome area, registration zone, exhibition zone',
        'Sponsorship of one panel or speech',
        'Logo on delegate bags',
        'Branded items in delegate bags',
        'Logo on various conference materials'
    ),
    speaking_privileges = jsonb_build_array(
        'Speaking opportunity'
    ),
    digital_privileges = jsonb_build_array(
        '4 fully hosted passes (both days + Gala)',
        'Logo on NBAC website',
        'Named in all delegate communications',
        '4 social media posts'
    ),
    updated_at = now()
WHERE id = 'gold';

UPDATE public.sponsor_tiers_db SET
    name = 'Silver Sponsor',
    price = 10000,
    sort_order = 2,
    branding_privileges = jsonb_build_array(
        'Sponsorship of Speed Networking Session',
        'Sponsor branding: "Sponsored by..."',
        'Visible branding in welcome area, registration zone',
        'Logo on delegate bags',
        'Branded items in delegate bags',
        'Logo on various conference materials'
    ),
    speaking_privileges = jsonb_build_array(
        'Speaking opportunity'
    ),
    digital_privileges = jsonb_build_array(
        '3 fully hosted passes (both days + Gala)',
        'Logo on NBAC website',
        'Named in all delegate communications',
        '3 social media posts'
    ),
    updated_at = now()
WHERE id = 'silver';

UPDATE public.sponsor_tiers_db SET
    name = 'Bronze Sponsor',
    price = 5000,
    sort_order = 3,
    branding_privileges = jsonb_build_array(
        'Sponsor branding: "Sponsored by..."',
        'Visible branding in registration zone',
        'Branded items in delegate bags',
        'Logo on various conference materials'
    ),
    speaking_privileges = '[]'::jsonb,
    digital_privileges = jsonb_build_array(
        '2 fully hosted passes (both days + Gala)',
        'Logo on NBAC website',
        'Named in some delegate communications',
        '2 social media posts'
    ),
    updated_at = now()
WHERE id = 'bronze';

-- All four tiers must exist; a silent zero-row UPDATE would leave a tier
-- showing its old benefits.
DO $do$
BEGIN
    IF (SELECT count(*) FROM public.sponsor_tiers_db
        WHERE id IN ('platinum', 'gold', 'silver', 'bronze')) <> 4 THEN
        RAISE EXCEPTION 'Expected platinum, gold, silver and bronze rows in sponsor_tiers_db.';
    END IF;
END
$do$;

COMMIT;
