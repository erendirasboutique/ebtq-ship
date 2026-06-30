create extension if not exists pgcrypto;

create table if not exists shipping_customers (
  id uuid primary key default gen_random_uuid(),
  import_key text unique,
  first_name text,
  last_name text,
  customer_name text,
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

create table if not exists shipping_orders (
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
  parcel_weight_lb numeric default 1,
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
  postage_currency text default 'USD',
  status text default 'draft',
  notification_sent boolean default false,
  batch_selected boolean default false,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists shipping_orders_customer_id_idx on shipping_orders(customer_id);
create index if not exists shipping_orders_status_idx on shipping_orders(status);
create index if not exists shipping_customers_import_key_idx on shipping_customers(import_key);

alter table shipping_customers add column if not exists import_key text;
alter table shipping_customers add column if not exists first_name text;
alter table shipping_customers add column if not exists last_name text;
alter table shipping_customers add column if not exists customer_name text;
alter table shipping_customers add column if not exists email text;
alter table shipping_customers add column if not exists phone text;
alter table shipping_customers add column if not exists customer_email text;
alter table shipping_customers add column if not exists customer_phone text;
alter table shipping_customers add column if not exists customer_address text;
alter table shipping_customers add column if not exists address_line1 text;
alter table shipping_customers add column if not exists address_line2 text;
alter table shipping_customers add column if not exists city text;
alter table shipping_customers add column if not exists state text;
alter table shipping_customers add column if not exists zip text;
alter table shipping_customers add column if not exists country text default 'US';
alter table shipping_customers add column if not exists imported_order_count integer default 0;
alter table shipping_customers add column if not exists imported_spend numeric default 0;
alter table shipping_customers add column if not exists imported_reward_points integer default 0;
alter table shipping_customers add column if not exists order_count integer default 0;
alter table shipping_customers add column if not exists spend numeric default 0;
alter table shipping_customers add column if not exists reward_points integer default 0;
alter table shipping_customers add column if not exists notes text;
alter table shipping_customers add column if not exists imported_at timestamptz;
alter table shipping_customers add column if not exists created_at timestamptz default now();
alter table shipping_customers add column if not exists updated_at timestamptz default now();

alter table shipping_orders add column if not exists customer_id uuid references shipping_customers(id) on delete set null;
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
alter table shipping_orders add column if not exists parcel_length numeric default 13;
alter table shipping_orders add column if not exists parcel_width numeric default 10;
alter table shipping_orders add column if not exists parcel_height numeric default 10;
alter table shipping_orders add column if not exists parcel_weight numeric;
alter table shipping_orders add column if not exists parcel_weight_lb numeric default 1;
alter table shipping_orders add column if not exists parcel_weight_oz numeric default 0;
alter table shipping_orders add column if not exists signature_required boolean default false;
alter table shipping_orders add column if not exists carrier text;
alter table shipping_orders add column if not exists mail_class text;
alter table shipping_orders add column if not exists easypost_shipment_id text;
alter table shipping_orders add column if not exists easypost_rate_id text;
alter table shipping_orders add column if not exists easypost_tracker_id text;
alter table shipping_orders add column if not exists easypost_postage_label_id text;
alter table shipping_orders add column if not exists rates jsonb default '[]'::jsonb;
alter table shipping_orders add column if not exists tracking_number text;
alter table shipping_orders add column if not exists tracking_url text;
alter table shipping_orders add column if not exists label_url text;
alter table shipping_orders add column if not exists postage_amount text;
alter table shipping_orders add column if not exists postage_currency text default 'USD';
alter table shipping_orders add column if not exists status text default 'draft';
alter table shipping_orders add column if not exists notification_sent boolean default false;
alter table shipping_orders add column if not exists batch_selected boolean default false;
alter table shipping_orders add column if not exists notes text;
alter table shipping_orders add column if not exists created_at timestamptz default now();
alter table shipping_orders add column if not exists updated_at timestamptz default now();
