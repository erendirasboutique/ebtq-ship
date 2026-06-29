# Erendira's Boutique Ship.com Shipping Studio v3

A clean, reorganized internal shipping portal branded for Erendira's Boutique.

## Main Pages
- `/shipping` Dashboard
- `/shipping/create` Create Label
- `/shipping/customers` Customers + edit address + order history
- `/shipping/orders` Orders + customer popup + refund placeholder
- `/shipping/batch` Batch print label URLs
- `/shipping/analytics` Basic analytics
- `/shipping/settings` Environment variable guide

## Vercel Environment Variables
Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SHIPPING_PORTAL_PASSWORD`
- `SHIPPING_SESSION_SECRET`
- `SHIPCOM_ACCESS_TOKEN`

Optional, useful if Ship.com gives you exact endpoint paths:
- `SHIPCOM_API_BASE` defaults to `https://app.ship.com`
- `SHIPCOM_CREATE_ORDER_PATH` defaults to `/public/orders`
- `SHIPCOM_RATES_PATH` defaults to `/public/rates`
- `SHIPCOM_PURCHASE_LABEL_PATH` defaults to `/public/purchase-label`
- `SHIPCOM_REFUND_LABEL_PATH` defaults to `/public/refund-label`

## Supabase
Run `sql/setup.sql` in Supabase SQL Editor.

## Branding
Logo is in `public/logo.jpeg`.

Font loader is already configured for:
- `public/fonts/BringinboldNineties.woff2`
- `public/fonts/MDNichrome-Bold.woff2`

Add those font files locally before deploying if you have the font licenses/files. If not present, the portal falls back to system fonts.

## Important note about Ship.com
This app is structured around creating orders/labels inside the portal. Ship.com confirmed manually-created dashboard labels are not currently available through their API. Exact order/rate/refund endpoint paths may vary by account, so those paths are isolated in environment variables and `lib/shipcom.js`.
