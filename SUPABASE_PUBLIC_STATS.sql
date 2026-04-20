create or replace view public.public_stats as
select
  (select count(*)::bigint from public.places) as places_count,
  null::bigint as countries_count,
  (select count(*)::bigint from public.profiles) as users_count;

grant usage on schema public to anon;
grant select on public.public_stats to anon;
