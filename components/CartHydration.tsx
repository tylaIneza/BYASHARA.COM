"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";
import { useProductStore } from "@/lib/product-store";
import { useCurrencyStore } from "@/lib/currency-store";
import { useCategoryStore } from "@/lib/category-store";
import { useOrderStore } from "@/lib/order-store";
import { useCustomerStore } from "@/lib/customer-store";
import { useNotificationStore } from "@/lib/notification-store";

export function CartHydration() {
  const detect = useCurrencyStore((s) => s.detect);
  useEffect(() => {
    useCartStore.persist.rehydrate();
    useProductStore.getState().load();
    useCategoryStore.getState().load();
    useOrderStore.getState().load();
    useCustomerStore.getState().load();
    useNotificationStore.getState().load();
    detect();
  }, [detect]);
  return null;
}
