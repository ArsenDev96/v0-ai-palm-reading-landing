-- Allow readings to be stored before an email is attached.
--
-- analyzePalm() inserts the reading first (no email yet); revealReading()
-- attaches the visitor's email later. A NOT NULL constraint on `email` breaks
-- step 1 with: null value in column "email" ... violates not-null constraint.
--
-- Run this in the Supabase dashboard → SQL Editor → New query.

alter table public.users alter column email drop not null;
