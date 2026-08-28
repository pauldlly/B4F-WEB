import { supabase } from "../lib/supabase";
import type { GuestOrder, GuestOrderAccess } from "../types";
import { getGuestOrderAccess, getGuestOrderAccesses } from "./orderAccess";

async function invoke<T>(
  name: string,
  body: Record<string, unknown>,
): Promise<T>{
  if (!supabase) throw new Error("Supabase n’est pas configuré.");

  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) throw error;
  if (data?.ok === false) {
    throw new Error(data.message || "Une erreur est survenue.");
  }
  return data as T;
}

export async function getPublicOrder(
  orderId: string,
  accessToken?: string | null,
): Promise<GuestOrder> {
  const stored = getGuestOrderAccess(orderId);
  const result = await invoke<{ ok: true; order: GuestOrder }>(
    "get-public-order",
    {
      orderId,
      accessToken: accessToken || stored?.accessToken || null,
    },
  );

  return {
    ...result.order,
    accessToken: accessToken || stored?.accessToken || undefined,
  };
}

export async function getPublicOrders(): Promise<GuestOrder[]> {
  const guestAccesses: GuestOrderAccess[] = getGuestOrderAccesses();
  const result = await invoke<{ ok: true; orders: GuestOrder[] }>(
    "get-public-orders",
    { guestAccesses },
  );

  return result.orders.map((order) => ({
    ...order,
    accessToken:
      guestAccesses.find((access) => access.orderId === order.id)
        ?.accessToken ?? order.accessToken,
  }));
}

export async function getCheckoutStatus(
  orderId: string,
  accessToken?: string | null,
) {
  const stored = getGuestOrderAccess(orderId);
  return await invoke<{
    ok: true;
    status: GuestOrder["status"];
    order?: GuestOrder;
    reference?: string;
  }>("get-public-checkout-status", {
    orderId,
    accessToken: accessToken || stored?.accessToken || null,
  });
}
