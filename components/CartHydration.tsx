"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";
import { useProductStore } from "@/lib/product-store";
import { useCurrencyStore } from "@/lib/currency-store";
import { useCategoryStore } from "@/lib/category-store";

export function CartHydration() {
  const detect = useCurrencyStore((s) => s.detect);
  useEffect(() => {
    useCartStore.persist.rehydrate();
    useProductStore.persist.rehydrate();
    useCategoryStore.persist.rehydrate();
    detect();
  }, [detect]);
  return null;
}
