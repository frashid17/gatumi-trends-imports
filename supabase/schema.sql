-- Gatumi's Trends Imports — run in Supabase SQL Editor (or via migrations)

create extension if not exists "pgcrypto";

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories (id) on delete set null,
  name text not null,
  description text not null default '',
  image_url text,
  image_urls jsonb not null default '[]'::jsonb,
  price_hint text,
  stock_quantity integer null,
  sold_out boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  size text,
  color text,
  stock_quantity integer null,
  sold_out boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists site_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table categories enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table site_settings enable row level security;

create policy "categories_select_public" on categories
  for select using (true);

create policy "products_select_public" on products
  for select using (true);

create policy "product_variants_select_public" on product_variants
  for select using (true);

create policy "site_settings_select_public" on site_settings
  for select using (true);

-- Default WhatsApp (digits only, country code included). Replace in admin.
insert into site_settings (key, value)
values ('whatsapp_number', '0000000000000')
on conflict (key) do nothing;

-- Seed categories (idempotent by slug)
insert into categories (name, slug) values
  ('Cosmetics', 'cosmetics'),
  ('Kids shoes', 'kids-shoes'),
  ('Households', 'households'),
  ('Kitchen', 'kitchen'),
  ('Bags', 'bags'),
  ('Wigs', 'wigs'),
  ('Womenwear and shoes', 'womenwear-and-shoes'),
  ('Menwear and shoes', 'menwear-and-shoes'),
  ('Kids clothes', 'kids-clothes'),
  ('Electronics', 'electronics'),
  ('perfumes', 'perfumes')
on conflict (slug) do nothing;
