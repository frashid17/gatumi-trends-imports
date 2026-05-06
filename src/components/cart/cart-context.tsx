"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartLine = {
  lineId: string;
  productId: string;
  name: string;
  image_url: string | null;
  price_hint: string | null;
  variantId: string | null;
  size: string | null;
  color: string | null;
  qty: number;
};

type CartContextValue = {
  lines: CartLine[];
  addLine: (line: Omit<CartLine, "qty" | "lineId"> & { qty?: number }) => void;
  removeLine: (lineId: string) => void;
  setQty: (lineId: string, qty: number) => void;
  clear: () => void;
  totalItems: number;
};

const STORAGE_KEY = "gatumis-cart-v1";

const CartContext = createContext<CartContextValue | null>(null);

function readStorage(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((line) => {
      const variantId = (line as Partial<CartLine>).variantId ?? null;
      const size = (line as Partial<CartLine>).size ?? null;
      const color = (line as Partial<CartLine>).color ?? null;
      const lineId =
        (line as Partial<CartLine>).lineId ??
        `${line.productId}::${variantId ?? ""}::${size ?? ""}::${color ?? ""}`;
      return { ...line, lineId, variantId, size, color };
    });
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- hydrate cart from localStorage after mount */
    setLines(readStorage());
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, ready]);

  const addLine = useCallback((line: Omit<CartLine, "qty" | "lineId"> & { qty?: number }) => {
    const qty = line.qty ?? 1;
    const lineId = `${line.productId}::${line.variantId ?? ""}::${line.size ?? ""}::${line.color ?? ""}`;
    setLines((prev) => {
      const i = prev.findIndex((l) => l.lineId === lineId);
      if (i === -1) {
        return [
          ...prev,
          {
            lineId,
            productId: line.productId,
            name: line.name,
            image_url: line.image_url,
            price_hint: line.price_hint,
            variantId: line.variantId ?? null,
            size: line.size ?? null,
            color: line.color ?? null,
            qty,
          },
        ];
      }
      const next = [...prev];
      next[i] = { ...next[i], qty: next[i].qty + qty };
      return next;
    });
  }, []);

  const removeLine = useCallback((lineId: string) => {
    setLines((prev) => prev.filter((l) => l.lineId !== lineId));
  }, []);

  const setQty = useCallback((lineId: string, qty: number) => {
    if (qty < 1) {
      setLines((prev) => prev.filter((l) => l.lineId !== lineId));
      return;
    }
    setLines((prev) =>
      prev.map((l) => (l.lineId === lineId ? { ...l, qty } : l)),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const totalItems = useMemo(
    () => lines.reduce((s, l) => s + l.qty, 0),
    [lines],
  );

  const value = useMemo(
    () => ({
      lines,
      addLine,
      removeLine,
      setQty,
      clear,
      totalItems,
    }),
    [lines, addLine, removeLine, setQty, clear, totalItems],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
