import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";

import type { GuestOrder } from "../types";

const STORAGE_KEY = "b4f-demo-orders-v10";

type OrdersContextValue = {
  orders: GuestOrder[];
  saveOrder: (order: GuestOrder) => void;
  findOrder: (orderId: string, accessToken?: string | null) => GuestOrder | null;
};

const OrdersContext = createContext<OrdersContextValue | null>(null);

function loadOrders(): GuestOrder[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<GuestOrder[]>(loadOrders);

  const value = useMemo<OrdersContextValue>(
    () => ({
      orders,
      saveOrder: (order) => {
        const next = [order, ...orders.filter((item) => item.id !== order.id)];
        setOrders(next);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      },
      findOrder: (orderId, accessToken) => {
        const order = orders.find((item) => item.id === orderId) ?? null;
        if (!order) return null;
        if (accessToken && order.accessToken !== accessToken) return null;
        return order;
      },
    }),
    [orders],
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const value = useContext(OrdersContext);
  if (!value) throw new Error("useOrders doit être utilisé dans OrdersProvider.");
  return value;
}
