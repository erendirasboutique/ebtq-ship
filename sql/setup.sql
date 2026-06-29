create table if not exists shipping_orders (
  id uuid primary key default gen_random_uuid(),
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
  weight_unit text default 'oz',
  parcel_length text,
  parcel_width text,
  parcel_height text,
  printer_type text default 'thermal',
  ship_date text,
  require_signature boolean default false,
  saturday_delivery_ups boolean default false,
  additional_handling_ups boolean default false,
  insurance_enabled boolean default false,
  insure_shipping boolean default false,
  insured_value text,
  package_type_ups text,
  notes text,
  shipcom_order_id text,
  shipcom_label_id text,
  carrier text,
  mail_class text,
  rate_id text,
  package_id text,
  tracking_number text unique,
  tracking_url text,
  label_url text,
  shipment_date text,
  status text default 'draft',
  source text default 'shipcom',
  notification_sent boolean default false,
  refund_response text,
  batch_id text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table shipping_orders add column if not exists customer_phone text;
alter table shipping_orders add column if not exists customer_address text;
alter table shipping_orders add column if not exists address_line1 text;
alter table shipping_orders add column if not exists address_line2 text;
alter table shipping_orders add column if not exists city text;
alter table shipping_orders add column if not exists state text;
alter table shipping_orders add column if not exists zip text;
alter table shipping_orders add column if not exists country text default 'US';
alter table shipping_orders add column if not exists parcel_weight text;
alter table shipping_orders add column if not exists weight_unit text default 'oz';
alter table shipping_orders add column if not exists parcel_length text;
alter table shipping_orders add column if not exists parcel_width text;
alter table shipping_orders add column if not exists parcel_height text;
alter table shipping_orders add column if not exists printer_type text default 'thermal';
alter table shipping_orders add column if not exists ship_date text;
alter table shipping_orders add column if not exists require_signature boolean default false;
alter table shipping_orders add column if not exists saturday_delivery_ups boolean default false;
alter table shipping_orders add column if not exists additional_handling_ups boolean default false;
alter table shipping_orders add column if not exists insurance_enabled boolean default false;
alter table shipping_orders add column if not exists insure_shipping boolean default false;
alter table shipping_orders add column if not exists insured_value text;
alter table shipping_orders add column if not exists package_type_ups text;
alter table shipping_orders add column if not exists notes text;
alter table shipping_orders add column if not exists shipcom_order_id text;
alter table shipping_orders add column if not exists shipcom_label_id text;
alter table shipping_orders add column if not exists carrier text;
alter table shipping_orders add column if not exists mail_class text;
alter table shipping_orders add column if not exists rate_id text;
alter table shipping_orders add column if not exists package_id text;
alter table shipping_orders add column if not exists tracking_number text;
alter table shipping_orders add column if not exists tracking_url text;
alter table shipping_orders add column if not exists label_url text;
alter table shipping_orders add column if not exists shipment_date text;
alter table shipping_orders add column if not exists status text default 'draft';
alter table shipping_orders add column if not exists source text default 'shipcom';
alter table shipping_orders add column if not exists notification_sent boolean default false;
alter table shipping_orders add column if not exists refund_response text;
alter table shipping_orders add column if not exists batch_id text;
alter table shipping_orders add column if not exists updated_at timestamp with time zone default now();

create unique index if not exists shipping_orders_tracking_number_idx on shipping_orders(tracking_number) where tracking_number is not null;
