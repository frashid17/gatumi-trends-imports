"use client";

import { useMemo, useState } from "react";
import type { ProductVariantRow } from "@/lib/catalog";

const SIZE_PRESETS = ["XS", "S", "M", "L", "XL", "XXL", "One size", "__custom__"] as const;

const COLOR_PRESETS = [
  "Black",
  "White",
  "Red",
  "Blue",
  "Navy",
  "Brown",
  "Grey",
  "Pink",
  "Olive",
  "Beige",
  "Cream",
  "Purple",
  "Orange",
  "Tan",
  "Burgundy",
  "Gold",
  "Silver",
  "Multicolor",
  "__custom__",
] as const;

type RowUi = {
  key: string;
  sizePreset: string;
  sizeCustom: string;
  colorPreset: string;
  colorCustom: string;
  stock: string;
  soldOut: boolean;
};

function safePipePart(s: string) {
  return s.replace(/\|/g, "—").trim();
}

function derivePresets(
  value: string | null,
  presetsNoCustom: readonly string[],
): { preset: string; custom: string } {
  const v = value?.trim() ?? "";
  if (!v) return { preset: "", custom: "" };
  if ((presetsNoCustom as readonly string[]).includes(v)) return { preset: v, custom: "" };
  return { preset: "__custom__", custom: v };
}

function rowsFromVariants(variants: ProductVariantRow[]): RowUi[] {
  if (!variants.length) return [];
  return variants.map((v) => {
    const sd = derivePresets(
      v.size,
      SIZE_PRESETS.filter((x) => x !== "__custom__"),
    );
    const cd = derivePresets(
      v.color,
      COLOR_PRESETS.filter((x) => x !== "__custom__"),
    );
    return {
      key: crypto.randomUUID(),
      sizePreset: sd.preset,
      sizeCustom: sd.custom,
      colorPreset: cd.preset,
      colorCustom: cd.custom,
      stock: v.stock_quantity == null ? "" : String(v.stock_quantity),
      soldOut: v.sold_out,
    };
  });
}

function serializeRows(rows: RowUi[]): string {
  const lines: string[] = [];
  for (const r of rows) {
    const size =
      r.sizePreset === "__custom__"
        ? safePipePart(r.sizeCustom)
        : safePipePart(r.sizePreset);
    const color =
      r.colorPreset === "__custom__"
        ? safePipePart(r.colorCustom)
        : safePipePart(r.colorPreset);
    if (!size && !color) continue;
    const stock = r.stock.trim();
    let stockPart = "";
    if (stock !== "") {
      const n = parseInt(stock, 10);
      if (!Number.isNaN(n) && n >= 0) stockPart = String(n);
    }
    let soldRaw = "";
    if (r.soldOut || (stockPart === "0")) {
      soldRaw = "yes";
    }
    lines.push(`${size}|${color}|${stockPart}|${soldRaw}`);
  }
  return lines.join("\n");
}

export function ProductVariantsField({ initialVariants = [] }: { initialVariants?: ProductVariantRow[] }) {
  const [rows, setRows] = useState<RowUi[]>(() =>
    initialVariants.length ? rowsFromVariants(initialVariants) : [],
  );

  const variantsInput = useMemo(() => serializeRows(rows), [rows]);

  function addRow() {
    setRows((prev) => [
      ...prev,
      {
        key: crypto.randomUUID(),
        sizePreset: "M",
        sizeCustom: "",
        colorPreset: "",
        colorCustom: "",
        stock: "",
        soldOut: false,
      },
    ]);
  }

  function removeRow(key: string) {
    setRows((prev) => prev.filter((r) => r.key !== key));
  }

  function updateRow(key: string, patch: Partial<Omit<RowUi, "key">>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  return (
    <fieldset className="space-y-3">
      <input type="hidden" name="variants_input" value={variantsInput} readOnly />

      <legend className="text-sm font-medium text-[var(--foreground-muted)]">
        Variants (size and/or color)
      </legend>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-elevated)]/40 px-3 py-4 text-sm text-[var(--foreground-muted)]">
          No variants yet. Add one row per size/color option. Inventory can be tracked per variant.
        </p>
      ) : (
        <ul className="space-y-4">
          {rows.map((r, index) => (
            <li
              key={r.key}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/80 p-3 sm:p-4"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--gold)]">
                  Variant {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeRow(r.key)}
                  className="text-xs font-medium text-red-400 hover:text-red-300 hover:underline"
                >
                  Remove
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="text-[var(--foreground-muted)]">Size</span>
                  <select
                    className="ui-select mt-1"
                    value={r.sizePreset}
                    onChange={(e) => updateRow(r.key, { sizePreset: e.target.value })}
                  >
                    <option value="">None</option>
                    {SIZE_PRESETS.filter((s) => s !== "__custom__").map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                    <option value="__custom__">Other…</option>
                  </select>
                  {r.sizePreset === "__custom__" ? (
                    <input
                      className="ui-input mt-2"
                      placeholder='e.g. "36 EU"'
                      value={r.sizeCustom}
                      onChange={(e) => updateRow(r.key, { sizeCustom: e.target.value })}
                    />
                  ) : null}
                </label>

                <label className="block text-sm">
                  <span className="text-[var(--foreground-muted)]">Color</span>
                  <select
                    className="ui-select mt-1"
                    value={r.colorPreset}
                    onChange={(e) => updateRow(r.key, { colorPreset: e.target.value })}
                  >
                    <option value="">None</option>
                    {COLOR_PRESETS.filter((c) => c !== "__custom__").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="__custom__">Other…</option>
                  </select>
                  {r.colorPreset === "__custom__" ? (
                    <input
                      className="ui-input mt-2"
                      placeholder='e.g. "Rose gold"'
                      value={r.colorCustom}
                      onChange={(e) => updateRow(r.key, { colorCustom: e.target.value })}
                    />
                  ) : null}
                </label>

                <label className="block text-sm sm:col-span-2">
                  <span className="text-[var(--foreground-muted)]">Stock (leave blank for unlimited)</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    inputMode="numeric"
                    className="ui-input mt-1 max-w-[12rem]"
                    placeholder="∞"
                    value={r.stock}
                    onChange={(e) =>
                      updateRow(r.key, { stock: e.target.value.replace(/[^\d]/g, "") })
                    }
                  />
                </label>

                <label className="flex items-center gap-2 text-sm sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={r.soldOut}
                    onChange={(e) => updateRow(r.key, { soldOut: e.target.checked })}
                    className="size-4 rounded border-[var(--border)] bg-[var(--surface-elevated)] accent-[var(--gold)]"
                  />
                  <span className="text-[var(--foreground-muted)]">
                    Mark this variant sold out (checked even if stock is set)
                  </span>
                </label>
              </div>
              <p className="mt-2 text-xs text-[var(--foreground-muted)]">
                At least one of <strong className="text-[var(--foreground-muted)]">Size</strong> or{" "}
                <strong className="text-[var(--foreground-muted)]">Color</strong> should be chosen.
              </p>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={addRow}
        className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]/40 px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--gold)]/40 hover:bg-[var(--nav-hover)]"
      >
        + Add variant row
      </button>
    </fieldset>
  );
}
