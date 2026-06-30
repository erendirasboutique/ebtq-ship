# Erendira's Boutique Shipping Studio v8

Tracking-portal style redesign for the internal EasyPost Shipping Studio.

## Included
- Google/Supabase login flow
- Working sign out button
- Dashboard, Create Label, Orders, Customers, Batch Print
- EasyPost 4x6 labels
- Cream/green/purple boutique styling
- No heavy gradients or bouncing animations
- Logo, favicon, and uploaded fonts included

## Deploy
1. Run `sql/setup.sql` in Supabase.
2. Add Vercel environment variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - NEXT_PUBLIC_SITE_URL=https://ship.erendirasboutique.com
   - EASYPOST_API_KEY
   - SHIPPING_SESSION_SECRET
   - SHIP_FROM_PHONE
   - SHIP_FROM_EMAIL
3. Upload folder contents to GitHub.
4. Deploy on Vercel.
