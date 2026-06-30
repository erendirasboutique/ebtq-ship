# Erendira's Boutique EasyPost Shipping Studio v6

Clean rebuild with no gradients. Includes:
- Dashboard, Create Label, Orders, Customers, Batch Print
- EasyPost labels with 4x6 PDF labels
- Lbs + oz inputs, default box 13 × 10 × 10
- Signature confirmation option
- CSV customer import and manual customer creation/editing
- Orders page with shipment detail popup
- Batch print selected purchased labels into one PDF

## Vercel Environment Variables

```env
EASYPOST_API_KEY=your_easypost_test_or_live_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SHIPPING_PORTAL_PASSWORD=your_password
SHIPPING_SESSION_SECRET=long_random_secret_32_plus_chars
SHIP_FROM_PHONE=optional
SHIP_FROM_EMAIL=optional
```

## Supabase
Run `sql/setup.sql` in Supabase SQL Editor before using the portal.

## Upload
Upload the folder contents to GitHub. Do not upload `node_modules`, `.next`, `.env`, or `.env.local`.
