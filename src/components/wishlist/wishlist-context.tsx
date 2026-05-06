"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type WishlistItem = {
  productId: string;
  name: string;
  image_url: string | null;
  price_hint: string | null;
};

const STORAGE_KEY = "gatumis-wishlist-v1";

type WishlistContextValue = {
  items: WishlistItem[];
  toggle: (item: WishlistItem) => void;
  remove: (productId: string) => void;
  has: (productId: string) => boolean;
  count: number;
  ready: boolean;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

function readStorage(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WishlistItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is WishlistItem =>
        Boolean(x && typeof x.productId === "string" && typeof x.name === "string"),
    );
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(readStorage());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const toggle = useCallback((item: WishlistItem) => {
    setItems((prev) => {
      const i = prev.findIndex((p) => p.productId === item.productId);
      if (i === -1) return [...prev, item];
      return prev.filter((p) => p.productId !== item.productId);
    });
  }, []);

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((p) => p.productId !== productId));
  }, []);

  const has = useCallback(
    (productId: string) => items.some((p) => p.productId === productId),
    [items],
  );

  const count = items.length;

  const value = useMemo(
    () => ({ items, toggle, remove, has, count, ready }),
    [items, toggle, remove, has, count, ready],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
