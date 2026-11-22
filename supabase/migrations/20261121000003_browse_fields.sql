-- US-01 browse fields. Nullable: null means "not specified".
begin;

alter table public.events
  add column if not exists description text,
  add column if not exists neighborhood text,
  add column if not exists end_time timestamptz;

alter table public.restaurants
  add column if not exists description text,
  add column if not exists neighborhood text;

commit;