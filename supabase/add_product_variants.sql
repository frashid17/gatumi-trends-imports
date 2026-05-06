-- Add product variants (size/color) with optional per-variant stock tracking.
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

alter table product_variants enable row level security;

drop policy if exists "product_variants_select_public" on product_variants;
create policy "product_variants_select_public" on product_variants
  for select using (true);
