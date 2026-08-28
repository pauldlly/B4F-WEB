import type { GuestOrderAccess } from "../types";

const STORAGE_KEY = "b4f-public-order-access-v10";

export function getGuestOrderAccesses(): GuestOrderAccess[] {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value)
      ? value.filter(
          (item) =>
            typeof item?.orderId === "string" &&
            typeof item?.accessToken === "string",
        )
      : [];
  } catch {
    return [];
  }
}

export function saveGuestOrderAccess(access: GuestOrderAccess) {
  const current = getGuestOrderAccesses();
  const next = [
    access,
    ...current.filter((item) => item.orderId !== access.orderId),
  ].slice(0, 50);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function getGuestOrderAccess(orderId: string) {
  return (
    getGuestOrderAccesses().find((item) => item.orderId === orderId) ?? null
  );
}
