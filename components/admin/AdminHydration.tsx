"use client";

import { useEffect } from "react";
import { useProductStore } from "@/lib/product-store";
import { useCategoryStore } from "@/lib/category-store";
import { useOrderStore } from "@/lib/order-store";
import { useCustomerStore } from "@/lib/customer-store";
import { useNotificationStore } from "@/lib/notification-store";

export function AdminHydration() {
  useEffect(() => {
    useProductStore.persist.rehydrate();
    useCategoryStore.persist.rehydrate();
    useOrderStore.persist.rehydrate();
    useCustomerStore.persist.rehydrate();
    useNotificationStore.persist.rehydrate();
  }, []);
  return null;
}
