# Erendira's Boutique EasyPost Shipping Studio v4

Updated workflow:
- 4x6 PDF labels by default
- default box dimensions: 13 x 10 x 10
- weight entry supports pounds + ounces
- signature delivery option
- manually save new customers from Create Label
- after purchasing a label, return to Dashboard to create another label
- dashboard batch-prints selected purchased labels into one PDF

## Setup
1. Run `sql/setup.sql` in Supabase. This resets and recreates the shipping tables.
2. Upload the folder contents to GitHub.
3. Add Vercel env vars:
   - EASYPOST_API_KEY
   - NEXT_PUBLIC_SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
   - SHIPPING_PORTAL_PASSWORD
   - SHIPPING_SESSION_SECRET
   - SHIP_FROM_PHONE optional
   - SHIP_FROM_EMAIL optional
