begin;

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source_type text not null,
  feed_url text,
  enabled boolean not null default true
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources(id),
  source_event_id text,
  dedupe_key text not null unique,
  title text not null,
  category text,
  start_time timestamptz,
  venue text,
  address text,
  price numeric(10, 2),
  latitude double precision,
  longitude double precision,
  source_url text,
  status text not null default 'pending',
  unique (source_id, source_event_id)
);

create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  address text,
  price numeric(10, 2),
  latitude double precision,
  longitude double precision,
  source_url text,
  published boolean not null default false
);

alter table public.sources enable row level security;
alter table public.events enable row level security;
alter table public.restaurants enable row level security;

grant select on public.events, public.restaurants to anon, authenticated;

create policy "Read published events" on public.events
  for select to anon, authenticated
  using (status = 'published');

create policy "Read published restaurants" on public.restaurants
  for select to anon, authenticated
  using (published);

commit;