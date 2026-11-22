begin;

alter table public.events
  add column if not exists audience_tags text[] not null default '{}',
  add column if not exists is_indoor boolean,
  add column if not exists kid_friendly boolean,
  add column if not exists wheelchair_accessible boolean,
  add column if not exists safety_notes text,
  add column if not exists min_age integer;

alter table public.restaurants
  add column if not exists audience_tags text[] not null default '{}',
  add column if not exists is_indoor boolean,
  add column if not exists kid_friendly boolean,
  add column if not exists wheelchair_accessible boolean,
  add column if not exists safety_notes text,
  add column if not exists min_age integer;

commit;