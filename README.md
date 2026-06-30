# Erendira's Boutique EasyPost Shipping Studio

A clean, branded Next.js shipping portal powered by EasyPost.

## Vercel Environment Variables

Required:

```env
EASYPOST_API_KEY=EZTK_or_EZAK_key_here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SHIPPING_PORTAL_PASSWORD=your_login_password
SHIPPING_SESSION_SECRET=long_random_secret
```

Required ship-from address:

```env
SHIP_FROM_NAME=Erendira's Boutique
SHIP_FROM_STREET1=your_shipping_street
SHIP_FROM_STREET2=
SHIP_FROM_CITY=your_city
SHIP_FROM_STATE=CA
SHIP_FROM_ZIP=your_zip
SHIP_FROM_PHONE=your_phone
SHIP_FROM_EMAIL=your_email
```

## Supabase

Run `sql/setup.sql` in Supabase SQL Editor.

## Usage

1. Log in at `/shipping/login`.
2. Go to Create Label.
3. Enter customer + package information.
4. Save Order.
5. Get Rates.
6. Buy Label.
7. Print the label from Orders.

## Notes

Use EasyPost test key first. Labels purchased with a live key can charge postage.
