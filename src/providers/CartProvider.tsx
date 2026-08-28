import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import type {
  CartItem,
  Gender,
  PackCartItem
} from "../types";

const STORAGE_KEY = "b4f-client-cart-v4";

type CartContextValue = {
  items: CartItem[];
  open: boolean;
  count: number;
  subtotal: number;
  serviceFee: number;
  total: number;
  setOpen: (open: boolean) => void;
  addItem: (item: CartItem) => void;
  removeItem: (key: string) => void;
  updateEventQuantity: (
    key: string,
    quantity: number
  ) => void;
  updatePackGenderQuantity: (
    key: string,
    gender: Gender,
    quantity: number
  ) => void;
  clear: () => void;
};

const CartContext =
  createContext<CartContextValue | null>(null);

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeQuantity(value: number) {
  const parsed = Math.floor(Number(value));
  return Number.isFinite(parsed)
    ? Math.max(0, parsed)
    : 0;
}

function clampQuantity(
  value: number,
  maximum: number | null
) {
  const safe = safeQuantity(value);
  return maximum === null
    ? safe
    : Math.min(maximum, safe);
}


function mergeExtras(
  current: CartItem["extras"],
  incoming: CartItem["extras"]
) {
  const map = new Map(
    current.map((extra) => [extra.key, extra])
  );

  incoming.forEach((extra) => {
    const existing = map.get(extra.key);

    map.set(
      extra.key,
      existing
        ? {
            ...extra,
            quantity:
              safeQuantity(existing.quantity) +
              safeQuantity(extra.quantity)
          }
        : extra
    );
  });

  return Array.from(map.values());
}

export function getPackQuantity(
  item: PackCartItem
) {
  return (
    safeQuantity(item.maleQuantity) +
    safeQuantity(item.femaleQuantity)
  );
}

export function getCartItemTotal(
  item: CartItem
) {
  const extrasTotal = item.extras.reduce(
    (sum, extra) =>
      sum +
      extra.unitPrice *
        safeQuantity(extra.quantity),
    0
  );

  if (item.kind === "event") {
    return (
      item.unitPrice *
        safeQuantity(item.quantity) +
      extrasTotal
    );
  }

  return (
    item.maleUnitPrice *
      safeQuantity(item.maleQuantity) +
    item.femaleUnitPrice *
      safeQuantity(item.femaleQuantity) +
    extrasTotal
  );
}

export function CartProvider({
  children
}: {
  children: ReactNode;
}) {
  const [items, setItems] =
    useState<CartItem[]>(loadCart);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items)
    );
  }, [items]);

  const addItem = (incoming: CartItem) => {
    setItems((current) => {
      const index = current.findIndex(
        (item) => item.key === incoming.key
      );

      if (index < 0) {
        return [...current, incoming];
      }

      return current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        if (
          item.kind === "event" &&
          incoming.kind === "event"
        ) {
          return {
            ...incoming,
            quantity: Math.max(
              1,
              clampQuantity(
                safeQuantity(item.quantity) +
                  safeQuantity(incoming.quantity),
                incoming.maximumAvailable
              )
            ),
            extras: mergeExtras(
              item.extras,
              incoming.extras
            )
          };
        }

        if (
          item.kind === "pack" &&
          incoming.kind === "pack"
        ) {
          return {
            ...incoming,
            maleQuantity: clampQuantity(
              safeQuantity(item.maleQuantity) +
                safeQuantity(incoming.maleQuantity),
              incoming.maleMaximumAvailable
            ),
            femaleQuantity: clampQuantity(
              safeQuantity(item.femaleQuantity) +
                safeQuantity(
                  incoming.femaleQuantity
                ),
              incoming.femaleMaximumAvailable
            ),
            extras: mergeExtras(
              item.extras,
              incoming.extras
            )
          };
        }

        return incoming;
      });
    });

    setOpen(true);
  };

  const removeItem = (key: string) => {
    setItems((current) =>
      current.filter((item) => item.key !== key)
    );
  };

  const updateEventQuantity = (
    key: string,
    quantity: number
  ) => {
    setItems((current) =>
      current
        .map((item) =>
          item.key === key && item.kind === "event"
            ? {
                ...item,
                quantity: Math.max(
                  1,
                  clampQuantity(
                    quantity,
                    item.maximumAvailable
                  )
                )
              }
            : item
        )
    );
  };

  const updatePackGenderQuantity = (
    key: string,
    gender: Gender,
    quantity: number
  ) => {
    setItems((current) =>
      current.map((item) => {
        if (
          item.key !== key ||
          item.kind !== "pack"
        ) {
          return item;
        }

        const next = clampQuantity(
          quantity,
          gender === "man"
            ? item.maleMaximumAvailable
            : item.femaleMaximumAvailable
        );

        return gender === "man"
          ? {
              ...item,
              maleQuantity: next
            }
          : {
              ...item,
              femaleQuantity: next
            };
      })
    );
  };

  const clear = () => {
    setItems([]);
    setOpen(false);
  };

  const count = useMemo(
    () =>
      items.reduce((sum, item) => {
        if (item.kind === "event") {
          return (
            sum + safeQuantity(item.quantity)
          );
        }

        return sum + getPackQuantity(item);
      }, 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + getCartItemTotal(item),
        0
      ),
    [items]
  );

  const ticketCountForFees = useMemo(
    () =>
      items.reduce((sum, item) => {
        if (item.kind === "event") {
          return sum + safeQuantity(item.quantity);
        }

        return (
          sum +
          getPackQuantity(item) *
            Math.max(1, item.selectedEvents.length)
        );
      }, 0),
    [items]
  );

  const transactionFee =
    subtotal <= 0
      ? 0
      : subtotal <= 40
        ? 0.99
        : Math.round(subtotal * 0.025 * 100) / 100;
  const applicationFee =
    Math.round(ticketCountForFees * 0.5 * 100) / 100;
  const serviceFee =
    Math.round((transactionFee + applicationFee) * 100) / 100;

  const total = Math.round((subtotal + serviceFee) * 100) / 100;

  return (
    <CartContext.Provider
      value={{
        items,
        open,
        count,
        subtotal,
        serviceFee,
        total,
        setOpen,
        addItem,
        removeItem,
        updateEventQuantity,
        updatePackGenderQuantity,
        clear
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const value = useContext(CartContext);

  if (!value) {
    throw new Error(
      "useCart doit être utilisé dans CartProvider."
    );
  }

  return value;
}
