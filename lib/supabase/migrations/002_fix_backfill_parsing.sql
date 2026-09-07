-- =============================================================
-- MIGRATION: repair fields mis-parsed by the 001 backfill
-- =============================================================
-- Bug: 001 extracted fields with patterns like 'Job Title: (.*)'.
-- In PostgreSQL's POSIX regex, `.` matches newlines unless newline-
-- sensitive matching is requested, so every `(.*)` capture ran
-- greedily to the END of the multi-line message. Result: job_title,
-- country, role, source, verification_date and the final element of
-- areas_of_interest each swallowed the rest of the message.
--
-- Visible symptom: the "All Roles" filter on /admin/early-birds
-- rendered one option containing the entire submission text.
--
-- The authoritative text is still intact in contacts.message (001
-- only inserted, it never deleted), so re-derive from there using
-- [^newline]* instead of (.*).
--
-- Safe to run more than once — it only touches rows that still
-- contain a newline in a field that should never hold one.
-- =============================================================

UPDATE public.interests i
SET
    job_title = NULLIF(substring(c.message from E'Job Title: ([^\n]*)'), 'N/A'),
    country   = NULLIF(substring(c.message from E'Country: ([^\n]*)'), 'N/A'),
    role      = COALESCE(substring(c.message from E'Role: ([^\n]*)'), 'delegate'),
    source    = NULLIF(substring(c.message from E'Source: ([^\n]*)'), 'N/A'),
    verification_date = substring(c.message from E'Verification Date: ([^\n]*)'),
    areas_of_interest = CASE
        WHEN COALESCE(substring(c.message from E'Areas of Interest: ([^\n]*)'), 'None') = 'None'
            THEN '{}'::text[]
        ELSE string_to_array(substring(c.message from E'Areas of Interest: ([^\n]*)'), ', ')
    END
FROM public.contacts c
WHERE c.email = i.email
  AND c.created_at = i.created_at
  AND c.message LIKE '[NBAC STAND INTEREST FORM SUBMISSION]%'
  AND (
        i.role      LIKE E'%\n%'
     OR i.job_title LIKE E'%\n%'
     OR i.country   LIKE E'%\n%'
     OR i.source    LIKE E'%\n%'
     OR i.verification_date LIKE E'%\n%'
     OR array_to_string(i.areas_of_interest, '') LIKE E'%\n%'
  );
