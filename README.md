# Erendira's Boutique EasyPost Shipping Studio v5

## Setup
1. Run `sql/setup.sql` in Supabase SQL Editor.
2. Upload the folder contents to GitHub.
3. Add these Vercel environment variables:

```
EASYPOST_API_KEY=EZTK_or_EZAK_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SHIPPING_PORTAL_PASSWORD=your_login_password
SHIPPING_SESSION_SECRET=long_random_text_32_plus_chars
SHIP_FROM_PHONE=optional
SHIP_FROM_EMAIL=optional
```

## Fonts
For licensing safety, font files are not included. Add your own files here:

```
public/fonts/bring.otf
public/fonts/mdn.otf
```

## Features
- Manual customer creation
- CSV customer import
- Customer search when creating labels
- Editable customers
- Default box size 13 x 10 x 10
- Weight input in lbs + oz
- Signature confirmation option
- 4x6 EasyPost PDF labels
- Dashboard batch print opening selected label URLs
