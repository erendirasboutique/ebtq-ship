# Erendira's Boutique EasyPost Shipping Studio v2

This version adds:

- CSV customer import for Ship.com customer exports
- Search customer while creating a label
- Manual new customer creation
- Editable customer addresses
- Customer profile modal with portal order history
- Better order popup UI
- Batch label PDF printing from selected purchased labels
- Default package dimensions: 13 × 10 × 10
- Hardcoded ship-from address: Erendira's Boutique, 17121 Hawthorne Ave, Fontana, CA 92335

## Supabase

Run `sql/setup.sql` in Supabase SQL Editor.

## Vercel environment variables

Required:

```env
EASYPOST_API_KEY=EZTK_or_EZAK_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SHIPPING_PORTAL_PASSWORD=your_login_password
SHIPPING_SESSION_SECRET=long_random_32_plus_character_secret
```

Optional:

```env
SHIP_FROM_PHONE=
SHIP_FROM_EMAIL=
```

## Customer CSV import

Do not upload your customer CSV to GitHub. Log into the portal, go to Customers, and click **Import CSV**.

Supported CSV columns include:

- First
- Last
- Email
- Phone
- Address1
- Address2
- City
- State
- Zip
- OrderCount
- Spend
- RewardPoints

