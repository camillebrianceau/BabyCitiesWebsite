# BabyCities Website

Landing page for BabyCities, a community-driven app that helps parents find family-friendly places and practical baby amenities while they are out and about.

## What is BabyCities?

BabyCities helps families quickly find places with useful baby equipment and kid-friendly features such as:

- changing tables
- high chairs
- stroller access
- nursing areas
- microwaves
- indoor or outdoor play areas

The goal is simple: make family outings easier, whether you are around the corner or planning ahead for a trip.

## Project structure

- `index.html`: main landing page
- `terms-and-conditions.html`: legal terms page
- `privacy-policy.html`: privacy page
- `dist/styles.css`: site styles
- `dist/script.js`: interactive behavior, live counters, Supabase queries
- `dist/supabase-config.js`: public Supabase config used by the landing page

## Deployment

This repo is set up as a simple static website.

You can publish it directly on:

- GitHub Pages
- Netlify
- Vercel
- any static hosting service

No build step is required for the current version of the site.

## Supabase

The landing page can read public stats from Supabase for:

- places shared
- countries covered
- users in the community

It can also update the "you can find" counter in real time depending on the selected place type and baby filter.

Only the public project URL and public anon/publishable key should be used in this website.

## Contact

`hello@babycities.app`
