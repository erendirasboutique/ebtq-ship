# Erendira's Boutique Ship.com Label Studio

This is a clean Ship.com API portal where labels are created inside the portal.

## Vercel env vars

- NEXT_PUBLIC_SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- SHIPPING_PORTAL_PASSWORD
- SHIPPING_SESSION_SECRET
- SHIPCOM_ACCESS_TOKEN
- SHIPCOM_BASE_URL=https://app.ship.com
- SHIP_FROM_NAME
- SHIP_FROM_STREET1
- SHIP_FROM_STREET2 optional
- SHIP_FROM_CITY
- SHIP_FROM_STATE
- SHIP_FROM_ZIP

## Supabase
Run `sql/setup.sql` in Supabase SQL Editor.

## Important
Ship.com endpoint names may vary by account. This app isolates them in `lib/shipcom.js` so you only need to edit that one file if Ship.com gives you a different create-order or rates endpoint.
