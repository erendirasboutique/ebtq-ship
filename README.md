# Erendira Shipping Studio v9

A stronger tracking-portal-style redesign for the internal EasyPost shipping portal.

## What changed in v9

- Real sidebar layout instead of the old top navigation.
- Cream boutique background with green divider lines and purple heading accents.
- No heavy gradients, no bouncing animations, no hover movement.
- Larger logo/sidebar presence inspired by the tracking portal.
- Dashboard rebuilt with stronger hero, action cards, and recent shipment cards.
- Create Label page restyled into clear boutique sections: customer, address, package weight, dimensions, options.
- Orders, Customers, Batch Print cards restyled with flatter tracking-portal look.
- Sign out behavior remains wired through Supabase + `/api/auth/logout`.

## Setup

1. Run `sql/setup.sql` in Supabase.
2. Add Vercel env variables.
3. Deploy to Vercel.
