-- Run in Supabase SQL Editor (once) if products already exist without this column.

alter table products
  add column if not exists image_urls jsonb not null default '[]'::jsonb;

comment on column products.image_urls is
  'Ordered gallery image URLs (JSON array of strings). First image is mirrored in image_url for thumbnails and legacy reads.';

-- Backfill from legacy single image when gallery is empty
update products
set image_urls = jsonb_build_array(image_url)
where image_url is not null
  and image_url <> ''
  and coalesce(jsonb_array_length(image_urls), 0) = 0;
