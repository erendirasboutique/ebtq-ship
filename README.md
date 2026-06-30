# Erendira's Boutique Shipping Studio v10

Tracking-portal inspired UI rebuild with:

- Fixed desktop sidebar layout to remove the blank-space/footer issue
- Cream boutique UI with green and purple accents
- Little flower decorations
- Soft hover effects and animations
- Dashboard, Create Label, Orders, Customers, Batch Print
- Google/Supabase login support
- EasyPost label creation and 4x6 labels
- Orders modal with Cancel / Refund Label support

## Setup

1. Run `sql/setup.sql` in Supabase.
2. Add Vercel environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL=https://ship.erendirasboutique.com`
   - `EASYPOST_API_KEY`
   - `SHIPPING_SESSION_SECRET`
   - `SHIP_FROM_PHONE`
   - `SHIP_FROM_EMAIL`
3. Deploy to Vercel.
4. Configure Supabase Google Auth redirect URLs for your domain.

