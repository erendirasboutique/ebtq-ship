# Erendira's Boutique Shipping Studio v7

Clean EasyPost shipping portal with Google login, staff access, dark mode, customer management, orders, and batch printing.

## Setup

1. Run `sql/setup.sql` in Supabase.
2. Add your approved staff email:

```sql
insert into staff_users (email, name, role)
values ('your@email.com', 'Your Name', 'admin')
on conflict (email) do update set name = excluded.name, role = excluded.role;
```

3. Add Vercel environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=https://ship.erendirasboutique.com
EASYPOST_API_KEY=
SHIPPING_SESSION_SECRET=
SHIP_FROM_PHONE=
SHIP_FROM_EMAIL=
AUTHORIZED_EMAILS=optional@email.com,another@email.com
```

4. Supabase Auth URL configuration:

```txt
Site URL: https://ship.erendirasboutique.com
Redirect URL: https://ship.erendirasboutique.com/login
```

5. Google OAuth:

Authorized JavaScript origin:
```txt
https://ship.erendirasboutique.com
```

Authorized redirect URI:
```txt
https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback
```

## Included

- Apple-style no-gradient UI
- Dark mode toggle
- Google profile menu and avatar
- Role-based staff allowlist
- Dashboard analytics
- Orders with shipment details popup
- Customers with CSV import and inline editing
- Create label workflow with grouped address/weight/dimensions/options
- 4x6 EasyPost labels
- Batch print workflow
