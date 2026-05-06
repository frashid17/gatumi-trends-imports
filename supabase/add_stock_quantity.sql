-- Run in Supabase SQL Editor (once) if you already created the DB from schema.sql

alter table products
  add column if not exists stock_quantity integer null;

comment on column products.stock_quantity is
  'NULL = unlimited (no auto sold-out from checkout). Set a number to track stock; it decreases when a customer taps Send order on WhatsApp (best-effort).';
