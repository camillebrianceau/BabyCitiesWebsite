-- Geo-based country counting for BabyCities stats
--
-- Assumptions:
-- - `public.places.position` is a PostGIS geography/geometry point
-- - you do NOT want to modify `public.places`
--
-- Approach:
-- 1. create a helper table with country polygons
-- 2. load a country boundaries dataset into that table
-- 3. recreate `public.public_stats` so `countries_count` is computed from geo

create extension if not exists postgis;

create table if not exists public.country_boundaries (
  iso2 text primary key,
  name text not null,
  geom geometry(MultiPolygon, 4326) not null
);

create index if not exists country_boundaries_geom_idx
  on public.country_boundaries
  using gist (geom);

-- You need to import a country boundaries dataset into `public.country_boundaries`
-- before using the view below.
--
-- Recommended source:
-- Natural Earth admin 0 countries, converted to EPSG:4326 multipolygons.
--
-- Expected columns in `public.country_boundaries`:
-- - iso2
-- - name
-- - geom
--
-- Once the data is loaded, run the view definition below.

create or replace view public.public_stats as
with place_country as (
  select
    p.id,
    matched_country.iso2
  from public.places p
  left join lateral (
    select cb.iso2
    from public.country_boundaries cb
    where st_covers(cb.geom, p.position::geometry)
    order by st_area(cb.geom) asc
    limit 1
  ) as matched_country on true
)
select
  (select count(*)::bigint from public.places) as places_count,
  (
    select count(distinct iso2)::bigint
    from place_country
    where iso2 is not null
  ) as countries_count,
  (select count(*)::bigint from public.profiles) as users_count;

grant usage on schema public to anon;
grant select on public.public_stats to anon;
