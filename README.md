# Erendira's Boutique Shipping Studio v11

Internal Shipping Studio with Google/Supabase auth, Shippo labels, customers, orders, batch print, and a new Returns tab.

## New in v11
- Returns sidebar tab
- Generate customer return access codes
- View return requests submitted from the Returns Portal
- Create/print Shippo return labels from admin
- Track returns through `https://track.erendirasboutique.com/?tracking=...`
- Mark returns received/completed

## Env vars
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=https://ship.erendirasboutique.com
SHIPPO_API_TOKEN=
SHIPPING_SESSION_SECRET=
SHIP_FROM_PHONE=
SHIP_FROM_EMAIL=

Run `sql/setup.sql` in Supabase before deploying.


## v13 Shippo migration
This build uses Shippo for order rates, label purchase, refunds, and USPS-only return labels.

Required Vercel env var:
- SHIPPO_API_TOKEN

Keep these existing env vars:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_SITE_URL
- SHIPPING_SESSION_SECRET
- SHIP_FROM_PHONE
- SHIP_FROM_EMAIL

Run sql/setup.sql in Supabase after uploading this version.
