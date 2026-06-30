create table if not exists shipping_customers (
  id uuid primary key default gen_random_uuid(),
  import_key text unique,
  first_name text,
  last_name text,
  customer_name text,
  email text,
  phone text,
  customer_address text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  zip text,
  country text default 'US',
  imported_order_count integer default 0,
  imported_spend text,
  reward_points integer default 0,
  source text default 'manual',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists shipping_orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid,
  customer_name text,
  customer_email text,
  customer_phone text,
  customer_address text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  zip text,
  country text default 'US',
  parcel_weight text,
  parcel_length text,
  parcel_width text,
  parcel_height text,
  notes text,
  easypost_shipment_id text,
  easypost_rate_id text,
  easypost_tracker_id text,
  easypost_postage_label_id text,
  carrier text,
  mail_class text,
  tracking_number text unique,
  tracking_url text,
  label_url text,
  shipment_date text,
  postage_amount text,
  postage_currency text,
  status text default 'draft',
  source text default 'easypost',
  notification_sent boolean default false,
  refund_response text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table shipping_customers add column if not exists import_key text;
alter table shipping_customers add column if not exists first_name text;
alter table shipping_customers add column if not exists last_name text;
alter table shipping_customers add column if not exists customer_name text;
alter table shipping_customers add column if not exists email text;
alter table shipping_customers add column if not exists phone text;
alter table shipping_customers add column if not exists customer_address text;
alter table shipping_customers add column if not exists address_line1 text;
alter table shipping_customers add column if not exists address_line2 text;
alter table shipping_customers add column if not exists city text;
alter table shipping_customers add column if not exists state text;
alter table shipping_customers add column if not exists zip text;
alter table shipping_customers add column if not exists country text default 'US';
alter table shipping_customers add column if not exists imported_order_count integer default 0;
alter table shipping_customers add column if not exists imported_spend text;
alter table shipping_customers add column if not exists reward_points integer default 0;
alter table shipping_customers add column if not exists source text default 'manual';
alter table shipping_customers add column if not exists created_at timestamp with time zone default now();
alter table shipping_customers add column if not exists updated_at timestamp with time zone default now();

do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'shipping_customers_import_key_key'
  ) then
    alter table shipping_customers add constraint shipping_customers_import_key_key unique (import_key);
  end if;
end $$;

alter table shipping_orders add column if not exists customer_id uuid;
alter table shipping_orders add column if not exists customer_name text;
alter table shipping_orders add column if not exists customer_email text;
alter table shipping_orders add column if not exists customer_phone text;
alter table shipping_orders add column if not exists customer_address text;
alter table shipping_orders add column if not exists address_line1 text;
alter table shipping_orders add column if not exists address_line2 text;
alter table shipping_orders add column if not exists city text;
alter table shipping_orders add column if not exists state text;
alter table shipping_orders add column if not exists zip text;
alter table shipping_orders add column if not exists country text default 'US';
alter table shipping_orders add column if not exists parcel_weight text;
alter table shipping_orders add column if not exists parcel_length text;
alter table shipping_orders add column if not exists parcel_width text;
alter table shipping_orders add column if not exists parcel_height text;
alter table shipping_orders add column if not exists notes text;
alter table shipping_orders add column if not exists easypost_shipment_id text;
alter table shipping_orders add column if not exists easypost_rate_id text;
alter table shipping_orders add column if not exists easypost_tracker_id text;
alter table shipping_orders add column if not exists easypost_postage_label_id text;
alter table shipping_orders add column if not exists carrier text;
alter table shipping_orders add column if not exists mail_class text;
alter table shipping_orders add column if not exists tracking_number text;
alter table shipping_orders add column if not exists tracking_url text;
alter table shipping_orders add column if not exists label_url text;
alter table shipping_orders add column if not exists shipment_date text;
alter table shipping_orders add column if not exists postage_amount text;
alter table shipping_orders add column if not exists postage_currency text;
alter table shipping_orders add column if not exists status text default 'draft';
alter table shipping_orders add column if not exists source text default 'easypost';
alter table shipping_orders add column if not exists notification_sent boolean default false;
alter table shipping_orders add column if not exists refund_response text;
alter table shipping_orders add column if not exists created_at timestamp with time zone default now();
alter table shipping_orders add column if not exists updated_at timestamp with time zone default now();
