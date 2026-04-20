# Supabase Stats Setup

This landing page is ready to read public stats from Supabase, including on GitHub Pages.

## Safe to expose

You can use these values in a public repo:

- `Supabase project URL`
- `anon public key`

Never put the `service_role` key in this website.

## Live filter counter

The landing page can also count places in real time based on:

- selected place type
- selected baby filters

This uses:

- `public.place_types`
- `public.places`

So if you want the live counter to work, the anonymous role must be able to
read those resources.

At minimum, the frontend currently needs:

- `select` on `public.place_types`
- `select` on `public.places`

because the count is computed from filtered REST queries.

If you want a stricter setup later, we can replace this with a safer RPC
instead of querying `places` directly.

## Frontend config

Edit [public/dist/supabase-config.js](/Users/camillebrianceau/Projects/BabyCitiesWebsite/startuptemplate-main/public/dist/supabase-config.js) and fill:

```js
window.BABYCITIES_SUPABASE_CONFIG = {
  url: "https://YOUR_PROJECT.supabase.co",
  anonKey: "YOUR_PUBLIC_ANON_KEY",
  view: "public_stats",
  placesField: "places_count",
  countriesField: "countries_count",
  usersField: "users_count",
};
```

## Recommended backend setup

Create a dedicated public view for the landing page instead of reading raw app tables directly.

Simple version for the current site:

- `places_count`: total rows from `public.places`
- `users_count`: total rows from `public.profiles`
- `countries_count`: keep `NULL` for now until you add a geo-based country derivation
- the top stats section reads only from `public.public_stats`
- the inline live counter still reads `public.place_types` and `public.places`

Then, when you are ready, you can upgrade `countries_count` without changing
`public.places` by using a separate country polygons table.

Based on your current schema:

- total places: `public.places`
- users: `public.profiles`
- place type label: `public.place_types.name`
- cafe + high chair: `places.highchair = true` and a linked place type name matching cafe
- beach + stroller access: `places.stroller = true` and a linked place type name matching beach

Important note for `countries_count`:

Your current schema does not expose a country column on `public.places`.
Since `position` is a custom type and there is no country lookup table in the schema you sent, a reliable country count cannot be computed from this schema alone yet.

For now, the cleanest options are:

1. add a `country_code` or `country_name` column to `public.places`
2. maintain a derived table/view that maps each place to a country
3. leave `countries_count` as `NULL` until you add that information

If you want to keep `public.places` unchanged and compute the country from the
location, use a separate country polygons table and derive the country via
PostGIS.

There is a ready-to-use example here:

- [SUPABASE_COUNTRIES_FROM_LOCATION.sql](/Users/camillebrianceau/Projects/BabyCitiesWebsite/startuptemplate-main/SUPABASE_COUNTRIES_FROM_LOCATION.sql)

Recommended rollout:

1. run the simple `public_stats` view first
2. create and populate `public.country_boundaries`
3. run `SUPABASE_COUNTRIES_FROM_LOCATION.sql` to replace the view with the geo-based version

This approach assumes:

- `places.position` is a geography/geometry point
- you load a country boundaries dataset into `public.country_boundaries`

If your schema uses different table or column names, adapt the query.

## Public access

If you use RLS everywhere, make sure the anonymous role can read the view you expose for stats.

Example:

```sql
grant usage on schema public to anon;
grant select on public.public_stats to anon;
grant select on public.place_types to anon;
grant select on public.places to anon;
```

If you prefer, you can also expose a dedicated RPC or materialized view instead.

## What the site expects

The page fetches one row from:

```txt
/rest/v1/public_stats?select=*&limit=1
```

Expected fields:

- `places_count`
- `countries_count`
- `users_count`

You can rename these in `public/dist/supabase-config.js` if your field names differ.
