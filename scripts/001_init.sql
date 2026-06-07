-- Palm reading backend schema.
-- Run this in the Supabase dashboard → SQL Editor → New query.
--
-- Storage: also create a PUBLIC bucket named `palm-images`
-- (Dashboard → Storage → New bucket → name "palm-images" → toggle Public on).

create table if not exists public.users (
  id          bigint generated always as identity primary key,
  email       text,                                    -- attached on reveal
  image_url   text not null,
  analysis    text not null,                           -- full reading
  created_at  timestamp not null default now()
);

create index if not exists users_email_idx on public.users (email);

-- The server uses the secret/service-role key (which bypasses RLS), so no
-- public policies are needed. Enabling RLS with no policies keeps the table
-- locked to server-only access.
alter table public.users enable row level security;
