insert into public.sources (name, source_type, enabled)
select 'MTL NOW curated', 'website', true
where not exists (
  select 1
  from public.sources
  where name = 'MTL NOW curated'
    and source_type = 'website'
);