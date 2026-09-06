begin;
alter table public.city_visits add column if not exists visited_at timestamptz;
comment on column public.city_visits.visited_at is 'User-editable visit time; null means historical date unknown';
commit;
