create extension if not exists pgcrypto;

drop table if exists shipping_orders cascade;
drop table if exists shipping_customers cascade;

create table shipping_customers (
  id uuid primary key default gen_random_uuid(),
  import_key text unique,
  first_name text,
  last_name text,
  customer_name text not null,
  email text,
  phone text,
  customer_email text,
  customer_phone text,
  customer_address text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  zip text,
  country text default 'US',
  imported_order_count integer default 0,
  imported_spend numeric default 0,
  imported_reward_points integer default 0,
  order_count integer default 0,
  spend numeric default 0,
  reward_points integer default 0,
  notes text,
  imported_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table shipping_orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references shipping_customers(id) on delete set null,
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
  parcel_length numeric default 13,
  parcel_width numeric default 10,
  parcel_height numeric default 10,
  parcel_weight numeric,
  parcel_weight_lb numeric default 0,
  parcel_weight_oz numeric default 0,
  signature_required boolean default false,
  carrier text,
  mail_class text,
  easypost_shipment_id text,
  easypost_rate_id text,
  easypost_tracker_id text,
  easypost_postage_label_id text,
  rates jsonb default '[]'::jsonb,
  tracking_number text,
  tracking_url text,
  label_url text,
  postage_amount text,
  postage_currency text,
  status text default 'draft',
  notification_sent boolean default false,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index shipping_orders_customer_id_idx on shipping_orders(customer_id);
create index shipping_orders_status_idx on shipping_orders(status);
create index shipping_customers_search_idx on shipping_customers(customer_name, email, phone, zip);
