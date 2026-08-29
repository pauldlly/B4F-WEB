import {
  Armchair,
  ArrowLeft,
  ArrowRight,
  BadgePlus,
  CalendarDays,
  CheckCircle2,
  Minus,
  Package,
  Plus,
  Ticket,
  UserRound,
} from "lucide-react";

import {
  type CSSProperties,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  PhoneInput,
  type ParsedCountry,
} from "react-international-phone";

import "react-international-phone/style.css";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { Seo } from "../components/Seo";
import { useI18n } from "../i18n/LanguageProvider";
import { formatMoney } from "../lib/format";
import { useAffiliate } from "../providers/AffiliateProvider";
import { useAuth } from "../providers/AuthProvider";

import {
  getCartItemTotal,
  useCart,
} from "../providers/CartProvider";

import { useOrders } from "../providers/OrdersProvider";
import { createGuestCheckout } from "../services/checkout";

import type {
  GuestCustomer,
  SelectedExtra,
} from "../types";

/* =========================================================
   FRAIS
========================================================= */

const SERVICE_FEE_RATE = 0.025;
const SERVICE_FLAT_FEE = 1.49;
const SERVICE_FEE_THRESHOLD = 60;

/* =========================================================
   CUSTOMER
========================================================= */

const initialCustomer: GuestCustomer = {
  name: "",
  phoneCode: "+33",
  phone: "",
  email: "",
};

/* =========================================================
   PHONE
========================================================= */

const phoneStyle = {
  width: "100%",

  "--react-international-phone-height":
    "56px",

  "--react-international-phone-background-color":
    "transparent",

  "--react-international-phone-text-color":
    "#ffffff",

  "--react-international-phone-font-size":
    "14px",

  "--react-international-phone-border-radius":
    "0px",

  "--react-international-phone-border-color":
    "transparent",

  "--react-international-phone-country-selector-background-color":
    "transparent",

  "--react-international-phone-country-selector-background-color-hover":
    "rgba(255,255,255,.05)",

  "--react-international-phone-country-selector-border-color":
    "transparent",

  "--react-international-phone-country-selector-arrow-color":
    "rgba(255,255,255,.35)",

  "--react-international-phone-dropdown-item-background-color":
    "#151515",

  "--react-international-phone-dropdown-item-text-color":
    "rgba(255,255,255,.78)",

  "--react-international-phone-dropdown-item-dial-code-color":
    "rgba(255,255,255,.35)",

  "--react-international-phone-selected-dropdown-item-background-color":
    "#252525",

  "--react-international-phone-focused-dropdown-item-background-color":
    "#202020",

  "--react-international-phone-dropdown-shadow":
    "0 24px 70px rgba(0,0,0,.75)",

  "--react-international-phone-dropdown-item-height":
    "44px",
} as CSSProperties;

/* =========================================================
   GENERIC HELPERS
========================================================= */

type LooseRecord =
  Record<string, unknown>;

function getRecord(
  value: unknown,
): LooseRecord | null {
  if (
    typeof value === "object" &&
    value !== null
  ) {
    return value as LooseRecord;
  }

  return null;
}

function roundMoney(
  value: number,
) {
  if (
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return (
    Math.round(
      value * 100,
    ) / 100
  );
}

function getStringField(
  record: LooseRecord,
  fields: string[],
): string | null {
  for (
    const field
    of fields
  ) {
    const value =
      record[field];

    if (
      typeof value ===
        "string" &&
      value.trim()
    ) {
      return value.trim();
    }

    if (
      typeof value ===
        "number" &&
      Number.isFinite(value)
    ) {
      return String(value);
    }
  }

  return null;
}

/* =========================================================
   FRAIS
========================================================= */

function calculateServiceFee(
  amount: number,
) {
  const safeAmount =
    Math.max(
      0,
      Number(amount) || 0,
    );

  if (
    safeAmount <= 0
  ) {
    return 0;
  }

  if (
    safeAmount <=
    SERVICE_FEE_THRESHOLD
  ) {
    return SERVICE_FLAT_FEE;
  }

  return roundMoney(
    safeAmount *
      SERVICE_FEE_RATE,
  );
}

/* =========================================================
   IMAGE
========================================================= */

function getImageFromValue(
  value: unknown,
): string | null {
  if (
    typeof value ===
      "string" &&
    value.trim()
  ) {
    return value;
  }

  const record =
    getRecord(value);

  if (!record) {
    return null;
  }

  const values = [
    record.url,
    record.uri,
    record.imageUrl,
    record.image_url,
    record.src,
  ];

  for (
    const possibleValue
    of values
  ) {
    if (
      typeof possibleValue ===
        "string" &&
      possibleValue.trim()
    ) {
      return possibleValue;
    }
  }

  return null;
}

function getCartItemImage(
  item: unknown,
): string | null {
  const record =
    getRecord(item);

  if (!record) {
    return null;
  }

  const directCandidates = [
    record.imageUrl,
    record.image_url,
    record.image,
    record.eventImage,
    record.event_image,
    record.coverUrl,
    record.cover_url,
    record.thumbnail,
    record.thumbnailUrl,
  ];

  for (
    const candidate
    of directCandidates
  ) {
    const image =
      getImageFromValue(
        candidate,
      );

    if (image) {
      return image;
    }
  }

  const selectedEvents =
    Array.isArray(
      record.selectedEvents,
    )
      ? record.selectedEvents
      : [];

  for (
    const selectedEvent
    of selectedEvents
  ) {
    const eventRecord =
      getRecord(
        selectedEvent,
      );

    if (!eventRecord) {
      continue;
    }

    const eventCandidates = [
      eventRecord.imageUrl,
      eventRecord.image_url,
      eventRecord.image,
      eventRecord.eventImage,
      eventRecord.event_image,
      eventRecord.coverUrl,
      eventRecord.cover_url,
      eventRecord.thumbnail,
      eventRecord.thumbnailUrl,
    ];

    for (
      const candidate
      of eventCandidates
    ) {
      const image =
        getImageFromValue(
          candidate,
        );

      if (image) {
        return image;
      }
    }
  }

  return null;
}

/* =========================================================
   DATE
========================================================= */

function getDateFromRecord(
  record: LooseRecord,
): string | null {
  const directDate =
    getStringField(
      record,
      [
        "eventDate",
        "event_date",
        "date",
        "startDate",
        "start_date",
        "startsAt",
        "starts_at",
      ],
    );

  if (directDate) {
    return directDate;
  }

  const nestedEvent =
    getRecord(
      record.event,
    );

  if (!nestedEvent) {
    return null;
  }

  return getStringField(
    nestedEvent,
    [
      "eventDate",
      "event_date",
      "date",
      "startDate",
      "start_date",
      "startsAt",
      "starts_at",
    ],
  );
}

function getCartItemDates(
  item: unknown,
): string[] {
  const record =
    getRecord(item);

  if (!record) {
    return [];
  }

  const dates =
    new Set<string>();

  const directDate =
    getDateFromRecord(
      record,
    );

  if (directDate) {
    dates.add(
      directDate,
    );
  }

  const selectedEvents =
    Array.isArray(
      record.selectedEvents,
    )
      ? record.selectedEvents
      : [];

  selectedEvents.forEach(
    (
      selectedEvent,
    ) => {
      const eventRecord =
        getRecord(
          selectedEvent,
        );

      if (!eventRecord) {
        return;
      }

      const eventDate =
        getDateFromRecord(
          eventRecord,
        );

      if (eventDate) {
        dates.add(
          eventDate,
        );
      }
    },
  );

  return Array.from(
    dates,
  );
}

function formatEventDate(
  value: string,
  locale: string,
) {
  let normalized =
    value.trim();

  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      normalized,
    )
  ) {
    normalized =
      `${normalized}T12:00:00`;
  }

  const date =
    new Date(
      normalized,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    locale || "fr-FR",
    {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  )
    .format(date)
    .replace(
      /\./g,
      "",
    );
}

/* =========================================================
   EVENT ID
========================================================= */

function getEventIdentity(
  value: unknown,
  fallback: string,
) {
  const record =
    getRecord(value);

  if (!record) {
    return fallback;
  }

  return (
    getStringField(
      record,
      [
        "eventId",
        "event_id",
        "id",
        "eventName",
        "event_name",
        "name",
        "title",
      ],
    ) ||
    fallback
  );
}

function getEventIdFromValue(
  value: unknown,
): number | null {
  const record =
    getRecord(value);

  if (!record) {
    return null;
  }

  const direct =
    record.eventId ??
    record.event_id;

  if (
    direct !== undefined &&
    direct !== null
  ) {
    const id =
      Number(direct);

    if (
      Number.isFinite(id)
    ) {
      return id;
    }
  }

  const nestedEvent =
    getRecord(
      record.event,
    );

  if (nestedEvent) {
    const nestedId =
      nestedEvent.eventId ??
      nestedEvent.event_id ??
      nestedEvent.id;

    const id =
      Number(
        nestedId,
      );

    if (
      Number.isFinite(id)
    ) {
      return id;
    }
  }

  return null;
}

/* =========================================================
   QUANTITY CONTROL
========================================================= */

type QuantityControlProps = {
  value: number;
  onMinus: () => void;
  onPlus: () => void;
  disableMinus?: boolean;
  disablePlus?: boolean;
  label?: string;
};

function QuantityControl({
  value,
  onMinus,
  onPlus,
  disableMinus = false,
  disablePlus = false,
  label,
}: QuantityControlProps) {
  return (
    <div
      className="
        inline-flex
        h-[32px]
        shrink-0
        items-center
        rounded-[10px]
        border
        border-white/[0.08]
        bg-[#0d0d0d]
        p-1
      "
    >
      {label && (
        <span
          className="
            whitespace-nowrap
            pl-2
            pr-1
            font-subtitle
            text-[8px]
            uppercase
            tracking-[0.08em]
            text-white/35
          "
        >
          {label}
        </span>
      )}

      <button
        type="button"
        onClick={
          onMinus
        }
        disabled={
          disableMinus
        }
        className="
          grid
          h-6
          w-6
          shrink-0
          place-items-center
          rounded-[7px]
          text-white/35
          outline-none
          ring-0
          transition

          hover:bg-white/[0.07]
          hover:text-white

          focus:outline-none
          focus:ring-0

          disabled:cursor-not-allowed
          disabled:opacity-20
          disabled:hover:bg-transparent
        "
      >
        <Minus
          size={12}
          strokeWidth={2.5}
        />
      </button>

      <span
        className="
          min-w-[23px]
          text-center
          font-subtitle
          text-[11px]
          text-white
        "
      >
        {value}
      </span>

      <button
        type="button"
        onClick={
          onPlus
        }
        disabled={
          disablePlus
        }
        className="
          grid
          h-6
          w-6
          shrink-0
          place-items-center
          rounded-[7px]
          bg-white/[0.06]
          text-white/60
          outline-none
          ring-0
          transition

          hover:bg-secondary
          hover:text-black

          focus:outline-none
          focus:ring-0

          disabled:cursor-not-allowed
          disabled:bg-white/[0.02]
          disabled:text-white/15
        "
      >
        <Plus
          size={12}
          strokeWidth={2.5}
        />
      </button>
    </div>
  );
}

/* =========================================================
   CHECKOUT
========================================================= */

export function CheckoutPage() {
  const navigate =
    useNavigate();

  const affiliate =
    useAffiliate();

  const {
    user,
    openAuth,
  } =
    useAuth();

  const {
    items,
    clear,
  } =
    useCart();

  const {
    saveOrder,
  } =
    useOrders();

  const {
    t,
    locale,
  } =
    useI18n();

  const [
    customer,
    setCustomer,
  ] =
    useState<GuestCustomer>(
      initialCustomer,
    );

  const [
    accepted,
    setAccepted,
  ] =
    useState(false);

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    showValidation,
    setShowValidation,
  ] =
    useState(false);

  const [
    checkoutItems,
    setCheckoutItems,
  ] =
    useState<typeof items>(
      items,
    );

  /* =====================================================
     SYNC CART
  ===================================================== */

  useEffect(() => {
    setCheckoutItems(
      items,
    );
  }, [
    items,
  ]);

  /* =====================================================
     USER
  ===================================================== */

  useEffect(() => {
    if (!user) {
      return;
    }

    setCustomer(
      (
        current,
      ) => ({
        ...current,

        name:
          current.name ||
          user.user_metadata
            ?.full_name ||
          user.email
            ?.split("@")[0] ||
          "",

        email:
          current.email ||
          user.email ||
          "",
      }),
    );

    setError("");
  }, [
    user,
  ]);

  /* =====================================================
     VALIDATION
  ===================================================== */

  const phoneValue =
    customer.phone
      ? `${customer.phoneCode}${customer.phone}`
      : "";

  const nameValid =
    customer.name
      .trim()
      .length >=
    2;

  const phoneValid =
    customer.phone
      .replace(
        /\D/g,
        "",
      )
      .length >=
    6;

  const emailValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      customer.email.trim(),
    );

  /* =====================================================
     EVENT TICKET COUNT
  ===================================================== */

  const getEventTicketCount = (
    source:
      typeof checkoutItems,

    eventId:
      number,
  ) => {
    return source.reduce(
      (
        total,
        item,
      ) => {
        if (
          item.kind !==
          "pack"
        ) {
          if (
            Number(
              item.eventId,
            ) ===
            Number(
              eventId,
            )
          ) {
            return (
              total +
              Math.max(
                0,
                item.quantity,
              )
            );
          }

          return total;
        }

        const containsEvent =
          item.selectedEvents.some(
            (
              selectedEvent,
            ) =>
              getEventIdFromValue(
                selectedEvent,
              ) ===
              Number(
                eventId,
              ),
          );

        if (
          !containsEvent
        ) {
          return total;
        }

        return (
          total +
          Math.max(
            0,
            item.maleQuantity,
          ) +
          Math.max(
            0,
            item.femaleQuantity,
          )
        );
      },
      0,
    );
  };

  /* =====================================================
     CLAMP EXTRAS
  ===================================================== */

  const clampAllExtras = (
    source:
      typeof checkoutItems,
  ): typeof checkoutItems => {
    return source.map(
      (
        item,
      ) => ({
        ...item,

        extras:
          (
            item.extras ??
            []
          ).map(
            (
              extra,
            ) => {
              const ticketCount =
                getEventTicketCount(
                  source,

                  Number(
                    extra.eventId,
                  ),
                );

              if (
                extra.kind ===
                "table"
              ) {
                return {
                  ...extra,

                  quantity:
                    ticketCount >
                    0
                      ? Math.min(
                          Math.max(
                            extra.quantity,
                            0,
                          ),
                          1,
                        )
                      : 0,
                };
              }

              return {
                ...extra,

                quantity:
                  Math.min(
                    Math.max(
                      extra.quantity,
                      0,
                    ),

                    ticketCount,
                  ),
              };
            },
          ),
      }),
    ) as typeof source;
  };

  /* =====================================================
     MERGE EXTRAS
  ===================================================== */

  const mergeExtras = (
    currentExtras:
      SelectedExtra[],

    incomingExtras:
      SelectedExtra[],
  ) => {
    const map =
      new Map<
        string,
        SelectedExtra
      >();

    [
      ...currentExtras,
      ...incomingExtras,
    ].forEach(
      (
        extra,
      ) => {
        const current =
          map.get(
            extra.key,
          );

        if (!current) {
          map.set(
            extra.key,
            extra,
          );

          return;
        }

        map.set(
          extra.key,
          {
            ...current,

            quantity:
              Math.max(
                current.quantity,
                extra.quantity,
              ),
          },
        );
      },
    );

    return Array.from(
      map.values(),
    );
  };

  /* =====================================================
     TOTALS
  ===================================================== */

  const checkoutSubtotal =
    useMemo(
      () =>
        roundMoney(
          checkoutItems.reduce(
            (
              sum,
              item,
            ) =>
              sum +
              getCartItemTotal(
                item,
              ),
            0,
          ),
        ),
      [
        checkoutItems,
      ],
    );

  const checkoutServiceFee =
    useMemo(
      () =>
        calculateServiceFee(
          checkoutSubtotal,
        ),
      [
        checkoutSubtotal,
      ],
    );

  const checkoutTotal =
    useMemo(
      () =>
        roundMoney(
          checkoutSubtotal +
            checkoutServiceFee,
        ),
      [
        checkoutSubtotal,
        checkoutServiceFee,
      ],
    );

  /* =====================================================
     EVENING COUNT
  ===================================================== */

  const eveningCount =
    useMemo(
      () => {
        const events =
          new Set<string>();

        checkoutItems.forEach(
          (
            item,
            itemIndex,
          ) => {
            if (
              item.kind ===
              "pack"
            ) {
              if (
                item.selectedEvents
                  .length ===
                0
              ) {
                events.add(
                  `pack-${item.key}`,
                );

                return;
              }

              item.selectedEvents.forEach(
                (
                  selectedEvent,
                  eventIndex,
                ) => {
                  events.add(
                    getEventIdentity(
                      selectedEvent,

                      `${item.key}-${itemIndex}-${eventIndex}`,
                    ),
                  );
                },
              );

              return;
            }

            events.add(
              String(
                item.eventId,
              ),
            );
          },
        );

        return events.size;
      },
      [
        checkoutItems,
      ],
    );

  const canSubmit =
    checkoutItems.length >
      0 &&
    !loading;

  /* =====================================================
     CUSTOMER
  ===================================================== */

  const update = (
    field:
      keyof GuestCustomer,

    value:
      string,
  ) => {
    setCustomer(
      (
        current,
      ) => ({
        ...current,

        [field]:
          value,
      }),
    );

    setError("");
  };

  const handlePhoneChange = (
    value: string,

    meta: {
      country:
        ParsedCountry;

      inputValue:
        string;
    },
  ) => {
    const dialCode =
      meta.country.dialCode;

    const digits =
      value.replace(
        /\D/g,
        "",
      );

    const nationalNumber =
      digits.startsWith(
        dialCode,
      )
        ? digits.slice(
            dialCode.length,
          )
        : digits;

    setCustomer(
      (
        current,
      ) => ({
        ...current,

        phoneCode:
          dialCode
            ? `+${dialCode}`
            : "",

        phone:
          nationalNumber,
      }),
    );

    setError("");
  };

  /* =====================================================
     EVENT QUANTITY
  ===================================================== */

  const updateEventQuantity = (
    key:
      string,

    delta:
      number,
  ) => {
    setCheckoutItems(
      (
        current,
      ) => {
        const target =
          current.find(
            (
              item,
            ) =>
              item.key ===
                key &&
              item.kind !==
                "pack",
          );

        if (
          !target ||
          target.kind ===
            "pack"
        ) {
          return current;
        }

        const maximum =
          target.maximumAvailable ??
          Number.POSITIVE_INFINITY;

        const nextQuantity =
          Math.max(
            0,

            Math.min(
              target.quantity +
                delta,

              maximum,
            ),
          );

        if (
          nextQuantity >
          0
        ) {
          const next =
            current.map(
              (
                item,
              ) => {
                if (
                  item.key !==
                    key ||
                  item.kind ===
                    "pack"
                ) {
                  return item;
                }

                return {
                  ...item,

                  quantity:
                    nextQuantity,
                };
              },
            ) as typeof current;

          return clampAllExtras(
            next,
          );
        }

        const eventId =
          target.eventId;

        const extrasToTransfer =
          target.extras ??
          [];

        let next =
          current.filter(
            (
              item,
            ) =>
              item.key !==
              key,
          ) as typeof current;

        const receiverIndex =
          next.findIndex(
            (
              item,
            ) =>
              item.kind !==
                "pack" &&
              Number(
                item.eventId,
              ) ===
                Number(
                  eventId,
                ),
          );

        if (
          receiverIndex >=
            0 &&
          extrasToTransfer.length >
            0
        ) {
          next =
            next.map(
              (
                item,
                index,
              ) => {
                if (
                  index !==
                  receiverIndex
                ) {
                  return item;
                }

                return {
                  ...item,

                  extras:
                    mergeExtras(
                      item.extras ??
                        [],

                      extrasToTransfer,
                    ),
                };
              },
            ) as typeof current;
        }

        return clampAllExtras(
          next,
        );
      },
    );

    setError("");
  };

  /* =====================================================
     PACK QUANTITY
  ===================================================== */

  const updatePackQuantity = (
    key:
      string,

    gender:
      | "man"
      | "woman",

    delta:
      number,
  ) => {
    setCheckoutItems(
      (
        current,
      ) => {
        const next =
          current.flatMap(
            (
              item,
            ) => {
              if (
                item.key !==
                  key ||
                item.kind !==
                  "pack"
              ) {
                return [
                  item,
                ];
              }

              const nextMen =
                gender ===
                "man"
                  ? Math.max(
                      0,

                      item.maleQuantity +
                        delta,
                    )
                  : item.maleQuantity;

              const nextWomen =
                gender ===
                "woman"
                  ? Math.max(
                      0,

                      item.femaleQuantity +
                        delta,
                    )
                  : item.femaleQuantity;

              if (
                nextMen +
                  nextWomen ===
                0
              ) {
                return [];
              }

              return [
                {
                  ...item,

                  maleQuantity:
                    nextMen,

                  femaleQuantity:
                    nextWomen,
                },
              ];
            },
          ) as typeof current;

        return clampAllExtras(
          next,
        );
      },
    );

    setError("");
  };

  /* =====================================================
     EXTRA QUANTITY
  ===================================================== */

  const updateExtraQuantity = (
    extraKey:
      string,

    delta:
      number,
  ) => {
    setCheckoutItems(
      (
        current,
      ) => {
        let targetExtra:
          SelectedExtra |
          null =
          null;

        for (
          const item
          of current
        ) {
          const extra =
            (
              item.extras ??
              []
            ).find(
              (
                currentExtra,
              ) =>
                currentExtra.key ===
                extraKey,
            );

          if (extra) {
            targetExtra =
              extra;

            break;
          }
        }

        if (
          !targetExtra
        ) {
          return current;
        }

        const ticketCount =
          getEventTicketCount(
            current,

            Number(
              targetExtra.eventId,
            ),
          );

        const maximum =
          targetExtra.kind ===
          "table"
            ? ticketCount >
              0
              ? 1
              : 0
            : ticketCount;

        const nextQuantity =
          Math.max(
            0,

            Math.min(
              targetExtra.quantity +
                delta,

              maximum,
            ),
          );

        return current.map(
          (
            item,
          ) => ({
            ...item,

            extras:
              (
                item.extras ??
                  []
              ).map(
                (
                  extra,
                ) =>
                  extra.key ===
                  extraKey
                    ? {
                        ...extra,

                        quantity:
                          nextQuantity,
                      }
                    : extra,
              ),
          }),
        ) as typeof current;
      },
    );

    setError("");
  };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const submit = async (
    event:
      FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setShowValidation(
      true,
    );

    if (!user) {
      if (
        !nameValid ||
        !phoneValid ||
        !emailValid
      ) {
        setError(
          "Vérifie les informations indiquées en rouge avant de continuer.",
        );

        return;
      }
    }

    if (
      !accepted
    ) {
      setError(
        "Tu dois accepter les conditions avant de continuer.",
      );

      return;
    }

    if (
      checkoutItems.length ===
      0
    ) {
      return;
    }

    try {
      setLoading(
        true,
      );

      setError("");

      const checkoutCustomer:
        GuestCustomer =
        user
          ? {
              ...customer,

              name:
                customer.name ||
                user.user_metadata
                  ?.full_name ||
                user.email
                  ?.split("@")[0] ||
                "Client B4F",

              email:
                customer.email ||
                user.email ||
                "",
            }
          : customer;

      const cleanCheckoutItems =
        checkoutItems.map(
          (
            item,
          ) => ({
            ...item,

            extras:
              (
                item.extras ??
                  []
              ).filter(
                (
                  extra,
                ) =>
                  extra.quantity >
                  0,
              ),
          }),
        ) as typeof checkoutItems;

      const result =
        await createGuestCheckout({
          customer:
            checkoutCustomer,

          affiliate: {
            promoterReference:
              affiliate.promoterReference,

            scopeType:
              affiliate.scopeType,

            scopeId:
              affiliate.scopeId,
          },

          items:
            cleanCheckoutItems,
        });

      if (
        result.mode ===
        "redirect"
      ) {
        window.location.assign(
          result.checkoutUrl,
        );

        return;
      }

      saveOrder(
        result.order,
      );

      clear();

      const params =
        new URLSearchParams({
          new:
            "1",
        });

      if (
        result.order
          .accessToken
      ) {
        params.set(
          "token",

          result.order
            .accessToken,
        );
      }

      navigate(
        `/commande/${result.order.id}?${params.toString()}`,
      );
    } catch (
      checkoutError:
        unknown
    ) {
      setError(
        checkoutError instanceof
          Error
          ? checkoutError.message
          : t(
              "checkout.paymentError",
            ),
      );
    } finally {
      setLoading(
        false,
      );
    }
  };

  /* =====================================================
     EMPTY CART
  ===================================================== */

  if (
    checkoutItems.length ===
    0
  ) {
    return (
      <div
        className="
          page-shell
          pb-16
          pt-20
          text-center

          sm:pb-20
          sm:pt-24

          lg:pt-32
        "
      >
        <Seo
          title={t(
            "cart.empty",
          )}
          description={t(
            "cart.emptyText",
          )}
          noIndex
        />

        <Ticket
          className="mx-auto text-white/20"
          size={48}
        />

        <h1 className="mt-5 font-title text-3xl uppercase">
          {t(
            "cart.empty",
          )}
        </h1>

        <p className="mt-3 font-body text-white/40">
          Ton panier ne contient plus de billet.
        </p>

        <Link
          to="/events"
          className="primary-button mt-6"
        >
          Voir les soirées
        </Link>
      </div>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#090909]
      "
    >
      <Seo
        title={t(
          "checkout.title",
        )}
        description={t(
          "checkout.description",
        )}
        path="/checkout"
        noIndex
      />

      <div
        className="
          pointer-events-none
          absolute
          -left-64
          top-0
          h-[520px]
          w-[520px]
          rounded-full
          bg-secondary/[0.04]
          blur-[160px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-64
          top-[380px]
          h-[500px]
          w-[500px]
          rounded-full
          bg-primary/[0.035]
          blur-[160px]
        "
      />

      {/* =================================================
          ESPACEMENT RESPONSIVE CORRIGÉ
      ================================================= */}

      <div
        className="
          page-shell
          relative
          pb-12
          pt-20

          sm:pb-16
          sm:pt-24

          lg:pb-20
          lg:pt-28
        "
      >
        {/* HEADER */}

        <div>
          <Link
            to="/"
            className="
              group
              inline-flex
              h-9
              items-center
              gap-2
              rounded-full
              border
              border-white/[0.08]
              bg-[#151515]
              px-3.5
              font-subtitle
              text-[9px]
              uppercase
              tracking-[0.13em]
              text-white/40
              transition

              hover:border-white/[0.15]
              hover:text-white
            "
          >
            <ArrowLeft
              size={13}
              className="
                transition-transform
                duration-200
                group-hover:-translate-x-0.5
              "
            />

            Retour
          </Link>

          <h1
            className="
              mt-3
              font-title
              text-4xl
              uppercase
              leading-[0.87]

              sm:mt-4
              sm:text-5xl
            "
          >
            Ta commande.
          </h1>

          <p
            className="
              mt-1
              font-body
              text-sm
              leading-6
              text-white/35
            "
          >
            Vérifie tes billets, tes options et tes tables avant de payer.
          </p>
        </div>

        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={
            submit
          }
          noValidate
          className="
            mt-4
            grid
            gap-4

            sm:mt-5
            sm:gap-5

            lg:mt-6
            lg:grid-cols-[minmax(0,1fr)_430px]
            lg:items-start
            lg:gap-6
          "
        >
          {/* CUSTOMER */}

          <section
            className="
              overflow-visible
              rounded-[28px]
              border
              border-white/[0.08]
              bg-[#111]
            "
          >
            {!user ? (
              <div className="p-5 sm:p-7">
                {/* ACCOUNT */}

                <div
                  className="
                    rounded-[20px]
                    border
                    border-secondary/20
                    bg-secondary/[0.06]
                    p-4
                  "
                >
                  <div
                    className="
                      flex
                      flex-col
                      gap-4

                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        gap-3
                      "
                    >
                      <span
                        className="
                          grid
                          h-11
                          w-11
                          shrink-0
                          place-items-center
                          rounded-[14px]
                          bg-secondary/10
                          text-secondary
                        "
                      >
                        <UserRound
                          size={20}
                        />
                      </span>

                      <div>
                        <strong
                          className="
                            block
                            font-subtitle
                            text-sm
                          "
                        >
                          Créer un compte B4F
                        </strong>

                        <span
                          className="
                            mt-1
                            block
                            font-body
                            text-[11px]
                            text-white/30
                          "
                        >
                          Retrouve facilement tes billets.
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        openAuth(
                          "register",
                        )
                      }
                      className="
                        shrink-0
                        rounded-full
                        bg-white
                        px-5
                        py-2.5
                        font-subtitle
                        text-[10px]
                        uppercase
                        tracking-[0.1em]
                        text-black
                        transition

                        hover:bg-white/90
                      "
                    >
                      Créer mon compte
                    </button>
                  </div>
                </div>

                {/* DIVIDER */}

                <div
                  className="
                    my-5
                    flex
                    items-center
                    gap-4

                    sm:my-6
                  "
                >
                  <span
                    className="
                      h-px
                      flex-1
                      bg-white/[0.08]
                    "
                  />

                  <span
                    className="
                      font-subtitle
                      text-[9px]
                      uppercase
                      tracking-[0.18em]
                      text-white/25
                    "
                  >
                    ou continuer sans compte
                  </span>

                  <span
                    className="
                      h-px
                      flex-1
                      bg-white/[0.08]
                    "
                  />
                </div>

                {/* FIELDS */}

                <div className="grid gap-4">
                  {/* NAME */}

                  <label>
                    <span
                      className="
                        mb-2
                        block
                        font-subtitle
                        text-xs
                      "
                    >
                      Nom du groupe ou du client
                    </span>

                    <input
                      value={
                        customer.name
                      }
                      onChange={(
                        event,
                      ) =>
                        update(
                          "name",
                          event.target.value,
                        )
                      }
                      className={`
                        h-[56px]
                        w-full
                        rounded-[16px]
                        border
                        bg-[#151515]
                        px-4
                        font-body
                        text-sm
                        text-white
                        outline-none
                        ring-0
                        transition
                        placeholder:text-white/20

                        focus:outline-none
                        focus:ring-0
                        focus-visible:outline-none
                        focus-visible:ring-0

                        ${
                          showValidation &&
                          !nameValid
                            ? "border-red-500/70 bg-red-500/[0.04]"
                            : "border-white/[0.09] hover:border-white/15 focus:border-white/20"
                        }
                      `}
                      placeholder="Pierre Dupont"
                      autoComplete="name"
                    />

                    {showValidation &&
                      !nameValid && (
                        <p
                          className="
                            mt-2
                            font-body
                            text-[10px]
                            leading-4
                            text-red-400
                          "
                        >
                          Renseigne ton nom.
                        </p>
                      )}
                  </label>

                  {/* PHONE */}

                  <div className="min-w-0">
                    <span
                      className="
                        mb-2
                        block
                        font-subtitle
                        text-xs
                      "
                    >
                      Téléphone
                    </span>

                    <div
                      className={`
                        relative
                        w-full
                        overflow-visible
                        rounded-[16px]
                        border
                        bg-[#151515]

                        ${
                          showValidation &&
                          !phoneValid
                            ? "border-red-500/70 bg-red-500/[0.04]"
                            : "border-white/[0.09]"
                        }
                      `}
                    >
                      <PhoneInput
                        defaultCountry="fr"
                        value={
                          phoneValue
                        }
                        onChange={
                          handlePhoneChange
                        }
                        preferredCountries={[
                          "fr",
                          "es",
                          "be",
                          "ch",
                          "gb",
                          "it",
                          "de",
                          "nl",
                          "pt",
                        ]}
                        forceDialCode
                        inputProps={{
                          name:
                            "phone",

                          autoComplete:
                            "tel",

                          placeholder:
                            "06 12 34 56 78",
                        }}
                        style={
                          phoneStyle
                        }
                        inputStyle={{
                          width:
                            "100%",

                          height:
                            "56px",

                          padding:
                            "0 16px",

                          background:
                            "transparent",

                          border:
                            "none",

                          outline:
                            "none",

                          boxShadow:
                            "none",
                        }}
                        countrySelectorStyleProps={{
                          buttonStyle: {
                            width:
                              "66px",

                            height:
                              "56px",

                            border:
                              "none",

                            borderRight:
                              "1px solid rgba(255,255,255,.08)",

                            borderRadius:
                              "15px 0 0 15px",

                            background:
                              "transparent",

                            outline:
                              "none",

                            boxShadow:
                              "none",
                          },

                          buttonContentWrapperStyle: {
                            gap:
                              "7px",
                          },

                          flagStyle: {
                            width:
                              "22px",
                          },

                          dropdownStyleProps: {
                            style: {
                              width:
                                "min(370px, calc(100vw - 40px))",

                              maxHeight:
                                "350px",

                              padding:
                                "8px",

                              background:
                                "#151515",

                              border:
                                "1px solid rgba(255,255,255,.10)",

                              borderRadius:
                                "18px",

                              overflowX:
                                "hidden",

                              boxShadow:
                                "0 28px 80px rgba(0,0,0,.8)",

                              zIndex:
                                100,
                            },

                            listItemStyle: {
                              minHeight:
                                "44px",

                              margin:
                                "2px 0",

                              padding:
                                "0 10px",

                              borderRadius:
                                "10px",
                            },

                            listItemCountryNameStyle: {
                              color:
                                "rgba(255,255,255,.78)",

                              fontSize:
                                "13px",
                            },

                            listItemDialCodeStyle: {
                              color:
                                "rgba(255,255,255,.32)",

                              fontSize:
                                "12px",
                            },
                          },
                        }}
                      />
                    </div>

                    {showValidation &&
                      !phoneValid && (
                        <p
                          className="
                            mt-2
                            font-body
                            text-[10px]
                            leading-4
                            text-red-400
                          "
                        >
                          Renseigne un numéro de téléphone valide.
                        </p>
                      )}
                  </div>

                  {/* EMAIL */}

                  <label>
                    <span
                      className="
                        mb-2
                        block
                        font-subtitle
                        text-xs
                      "
                    >
                      E-mail
                    </span>

                    <input
                      value={
                        customer.email
                      }
                      onChange={(
                        event,
                      ) =>
                        update(
                          "email",
                          event.target.value,
                        )
                      }
                      className={`
                        h-[56px]
                        w-full
                        rounded-[16px]
                        border
                        bg-[#151515]
                        px-4
                        font-body
                        text-sm
                        text-white
                        outline-none
                        ring-0
                        transition
                        placeholder:text-white/20

                        focus:outline-none
                        focus:ring-0

                        ${
                          showValidation &&
                          !emailValid
                            ? "border-red-500/70 bg-red-500/[0.04]"
                            : "border-white/[0.09]"
                        }
                      `}
                      type="email"
                      placeholder="pierre.dupont@gmail.com"
                      autoComplete="email"
                    />

                    {showValidation &&
                      !emailValid && (
                        <p
                          className="
                            mt-2
                            font-body
                            text-[10px]
                            leading-4
                            text-red-400
                          "
                        >
                          Renseigne une adresse e-mail valide.
                        </p>
                      )}
                  </label>

                  <PaymentSection
                    accepted={
                      accepted
                    }
                    setAccepted={
                      setAccepted
                    }
                    error={
                      error
                    }
                    loading={
                      loading
                    }
                    canSubmit={
                      canSubmit
                    }
                    total={
                      checkoutTotal
                    }
                    locale={
                      locale
                    }
                    acceptText={t(
                      "checkout.accept",
                    )}
                    preparingText={t(
                      "checkout.preparing",
                    )}
                    showValidation={
                      showValidation
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="p-5 sm:p-7">
                <div
                  className="
                    flex
                    items-center
                    gap-4
                  "
                >
                  <span
                    className="
                      grid
                      h-11
                      w-11
                      shrink-0
                      place-items-center
                      rounded-full
                      bg-green-500/10
                      text-green-400
                    "
                  >
                    <CheckCircle2
                      size={20}
                    />
                  </span>

                  <div className="min-w-0">
                    <span
                      className="
                        font-subtitle
                        text-[9px]
                        uppercase
                        tracking-[0.18em]
                        text-green-400
                      "
                    >
                      Compte connecté
                    </span>

                    <strong
                      className="
                        mt-1
                        block
                        truncate
                        font-subtitle
                        text-sm
                        text-white/80
                      "
                    >
                      {user.user_metadata
                        ?.full_name ||
                        user.email ||
                        "Compte B4F"}
                    </strong>

                    {user.email && (
                      <span
                        className="
                          mt-1
                          block
                          truncate
                          font-body
                          text-[11px]
                          text-white/30
                        "
                      >
                        {user.email}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5">
                  <PaymentSection
                    accepted={
                      accepted
                    }
                    setAccepted={
                      setAccepted
                    }
                    error={
                      error
                    }
                    loading={
                      loading
                    }
                    canSubmit={
                      canSubmit
                    }
                    total={
                      checkoutTotal
                    }
                    locale={
                      locale
                    }
                    acceptText={t(
                      "checkout.accept",
                    )}
                    preparingText={t(
                      "checkout.preparing",
                    )}
                    showValidation={
                      showValidation
                    }
                  />
                </div>
              </div>
            )}
          </section>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <aside
            className="
              h-fit
              overflow-hidden
              rounded-[24px]
              border
              border-white/[0.08]
              bg-[#111]

              sm:rounded-[28px]

              lg:sticky
              lg:top-28
            "
          >
            {/* HEADER */}

            <div
              className="
                border-b
                border-white/[0.07]
                px-4
                py-4

                sm:px-5
                sm:py-5
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-3
                "
              >
                <h2
                  className="
                    font-title
                    text-xl
                    uppercase

                    sm:text-2xl
                  "
                >
                  Récapitulatif
                </h2>

                <span
                  className="
                    rounded-full
                    border
                    border-white/[0.07]
                    bg-[#151515]
                    px-3
                    py-1.5
                    font-subtitle
                    text-[8px]
                    uppercase
                    text-white/35

                    sm:text-[9px]
                  "
                >
                  {eveningCount}{" "}
                  soirée
                  {eveningCount >
                  1
                    ? "s"
                    : ""}
                </span>
              </div>
            </div>

            {/* ITEMS */}

            <div
              className="
                custom-scrollbar
                max-h-[62vh]
                space-y-2
                overflow-y-auto
                p-3
              "
            >
              {checkoutItems.map(
                (
                  item,
                ) => {
                  const image =
                    getCartItemImage(
                      item,
                    );

                  const dates =
                    getCartItemDates(
                      item,
                    );

                  const extras =
                    item.extras ??
                    [];

                  const selectedExtras =
                    extras.filter(
                      (
                        extra,
                      ) =>
                        extra.quantity >
                        0,
                    );

                  const amount =
                    item.kind ===
                    "pack"
                      ? item.maleQuantity +
                        item.femaleQuantity
                      : item.quantity;

                  return (
                    <article
                      key={
                        item.key
                      }
                      className="
                        overflow-hidden
                        rounded-[17px]
                        border
                        border-white/[0.07]
                        bg-[#151515]
                      "
                    >
                      <div className="p-3">
                        <div
                          className="
                            grid
                            grid-cols-[60px_minmax(0,1fr)]
                            gap-3

                            sm:grid-cols-[68px_minmax(0,1fr)]
                          "
                        >
                          {/* IMAGE */}

                          <div
                            className="
                              h-[60px]
                              w-[60px]
                              overflow-hidden
                              rounded-[12px]
                              bg-[#0f0f0f]

                              sm:h-[68px]
                              sm:w-[68px]
                            "
                          >
                            {image ? (
                              <img
                                src={
                                  image
                                }
                                alt={
                                  item.kind ===
                                  "pack"
                                    ? item.packName
                                    : item.eventName
                                }
                                className="
                                  h-full
                                  w-full
                                  object-cover
                                "
                              />
                            ) : (
                              <div
                                className="
                                  grid
                                  h-full
                                  place-items-center
                                  text-white/20
                                "
                              >
                                {item.kind ===
                                "pack" ? (
                                  <Package
                                    size={20}
                                  />
                                ) : (
                                  <Ticket
                                    size={20}
                                  />
                                )}
                              </div>
                            )}
                          </div>

                          {/* INFO */}

                          <div className="min-w-0">
                            <div
                              className="
                                flex
                                items-start
                                justify-between
                                gap-2
                              "
                            >
                              <div className="min-w-0">
                                <span
                                  className="
                                    font-subtitle
                                    text-[8px]
                                    uppercase
                                    tracking-[0.1em]
                                    text-secondary

                                    sm:text-[9px]
                                  "
                                >
                                  {amount}{" "}

                                  {item.kind ===
                                  "pack"
                                    ? amount >
                                      1
                                      ? "packs"
                                      : "pack"
                                    : amount >
                                        1
                                      ? "billets"
                                      : "billet"}

                                  {item.kind !==
                                    "pack" && (
                                    <>
                                      {" "}

                                      {item.gender ===
                                      "woman"
                                        ? "Femme"
                                        : "Homme"}
                                    </>
                                  )}
                                </span>

                                {selectedExtras.length >
                                  0 && (
                                  <span
                                    className="
                                      ml-1.5
                                      rounded-full
                                      bg-green-500/[0.08]
                                      px-1.5
                                      py-0.5
                                      font-subtitle
                                      text-[6px]
                                      uppercase
                                      text-green-300

                                      sm:ml-2
                                      sm:px-2
                                      sm:py-1
                                      sm:text-[7px]
                                    "
                                  >
                                    {
                                      selectedExtras.length
                                    }{" "}
                                    extra
                                    {selectedExtras.length >
                                    1
                                      ? "s"
                                      : ""}
                                  </span>
                                )}
                              </div>

                              <strong
                                className="
                                  shrink-0
                                  font-subtitle
                                  text-[13px]

                                  sm:text-[14px]
                                "
                              >
                                {formatMoney(
                                  getCartItemTotal(
                                    item,
                                  ),
                                  locale,
                                )}
                              </strong>
                            </div>

                            <strong
                              className="
                                block
                                truncate
                                font-subtitle
                                text-[12px]
                                text-white/90

                                sm:text-[13px]
                              "
                            >
                              {item.kind ===
                              "pack"
                                ? item.packName
                                : item.eventName}
                            </strong>

                            <div
                              className="
                                flex
                                items-center
                                justify-between
                                gap-2
                              "
                            >
                              <div
                                className="
                                  flex
                                  min-w-0
                                  items-center
                                  gap-1.5
                                "
                              >
                                {dates.length >
                                  0 && (
                                  <>
                                    <CalendarDays
                                      size={11}
                                      className="
                                        shrink-0
                                        text-white/30
                                      "
                                    />

                                    <span
                                      className="
                                        truncate
                                        font-body
                                        text-[8px]
                                        text-white/35

                                        sm:text-[9px]
                                      "
                                    >
                                      {formatEventDate(
                                        dates[0],
                                        locale,
                                      )}

                                      {item.kind ===
                                        "pack" &&
                                      dates.length >
                                        1
                                        ? ` · +${dates.length - 1}`
                                        : ""}
                                    </span>
                                  </>
                                )}
                              </div>

                              {item.kind !==
                                "pack" && (
                                <QuantityControl
                                  value={
                                    item.quantity
                                  }
                                  onMinus={() =>
                                    updateEventQuantity(
                                      item.key,
                                      -1,
                                    )
                                  }
                                  onPlus={() =>
                                    updateEventQuantity(
                                      item.key,
                                      1,
                                    )
                                  }
                                  disablePlus={
                                    item.maximumAvailable !==
                                      null &&
                                    item.maximumAvailable !==
                                      undefined &&
                                    item.quantity >=
                                      item.maximumAvailable
                                  }
                                />
                              )}

                              {item.kind ===
                                "pack" && (
                                <div
                                  className="
                                    flex
                                    gap-1
                                  "
                                >
                                  {item.maleQuantity >
                                    0 && (
                                    <QuantityControl
                                      label="H"
                                      value={
                                        item.maleQuantity
                                      }
                                      onMinus={() =>
                                        updatePackQuantity(
                                          item.key,
                                          "man",
                                          -1,
                                        )
                                      }
                                      onPlus={() =>
                                        updatePackQuantity(
                                          item.key,
                                          "man",
                                          1,
                                        )
                                      }
                                    />
                                  )}

                                  {item.femaleQuantity >
                                    0 && (
                                    <QuantityControl
                                      label="F"
                                      value={
                                        item.femaleQuantity
                                      }
                                      onMinus={() =>
                                        updatePackQuantity(
                                          item.key,
                                          "woman",
                                          -1,
                                        )
                                      }
                                      onPlus={() =>
                                        updatePackQuantity(
                                          item.key,
                                          "woman",
                                          1,
                                        )
                                      }
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* OPTIONS */}

                      {extras.length >
                        0 && (
                        <div
                          className="
                            border-t
                            border-white/[0.07]
                            bg-[#101010]
                            p-3
                          "
                        >
                          <span
                            className="
                              mb-2
                              block
                              font-subtitle
                              text-[8px]
                              uppercase
                              tracking-[0.12em]
                              text-white/30
                            "
                          >
                            Options & tables
                          </span>

                          <div className="space-y-2">
                            {extras.map(
                              (
                                extra,
                              ) => {
                                const ticketCount =
                                  getEventTicketCount(
                                    checkoutItems,

                                    Number(
                                      extra.eventId,
                                    ),
                                  );

                                const maximum =
                                  extra.kind ===
                                  "table"
                                    ? ticketCount >
                                      0
                                      ? 1
                                      : 0
                                    : ticketCount;

                                const selected =
                                  extra.quantity >
                                  0;

                                return (
                                  <div
                                    key={
                                      extra.key
                                    }
                                    className={`
                                      flex
                                      items-center
                                      gap-2.5
                                      rounded-[13px]
                                      border
                                      px-2.5
                                      py-2.5
                                      transition

                                      sm:gap-3
                                      sm:px-3

                                      ${
                                        selected
                                          ? extra.kind ===
                                            "table"
                                            ? "border-[#ff4f9a]/20 bg-[#ff4f9a]/[0.04]"
                                            : "border-secondary/20 bg-secondary/[0.04]"
                                          : "border-white/[0.06] bg-white/[0.015]"
                                      }
                                    `}
                                  >
                                    <span
                                      className={`
                                        grid
                                        h-8
                                        w-8
                                        shrink-0
                                        place-items-center
                                        rounded-[9px]

                                        ${
                                          extra.kind ===
                                          "table"
                                            ? "bg-[#ff4f9a]/10 text-[#ff6aa8]"
                                            : "bg-secondary/10 text-secondary"
                                        }
                                      `}
                                    >
                                      {extra.kind ===
                                      "table" ? (
                                        <Armchair
                                          size={14}
                                        />
                                      ) : (
                                        <BadgePlus
                                          size={14}
                                        />
                                      )}
                                    </span>

                                    <div
                                      className="
                                        min-w-0
                                        flex-1
                                      "
                                    >
                                      <span
                                        className="
                                          block
                                          font-subtitle
                                          text-[7px]
                                          uppercase
                                          tracking-[0.1em]
                                          text-white/30
                                        "
                                      >
                                        {extra.kind ===
                                        "table"
                                          ? "Table"
                                          : "Option"}
                                      </span>

                                      <strong
                                        className="
                                          mt-0.5
                                          block
                                          truncate
                                          font-subtitle
                                          text-[10px]
                                          text-white/80

                                          sm:text-[11px]
                                        "
                                      >
                                        {extra.name}
                                      </strong>

                                      {extra.kind ===
                                        "table" &&
                                        typeof extra.fullPrice ===
                                          "number" &&
                                        extra.fullPrice >
                                          0 && (
                                          <span
                                            className="
                                              mt-0.5
                                              block
                                              font-body
                                              text-[8px]
                                              text-white/25
                                            "
                                          >
                                            Prix total :{" "}
                                            {formatMoney(
                                              extra.fullPrice,
                                              locale,
                                            )}
                                          </span>
                                        )}
                                    </div>

                                    <div
                                      className="
                                        shrink-0
                                        text-right
                                      "
                                    >
                                      <strong
                                        className={`
                                          block
                                          font-subtitle
                                          text-[10px]

                                          ${
                                            extra.kind ===
                                            "table"
                                              ? "text-[#ff6aa8]"
                                              : "text-secondary"
                                          }
                                        `}
                                      >
                                        {selected
                                          ? "+"
                                          : ""}

                                        {formatMoney(
                                          extra.unitPrice *
                                            extra.quantity,

                                          locale,
                                        )}
                                      </strong>

                                      <div className="mt-1.5">
                                        <QuantityControl
                                          value={
                                            extra.quantity
                                          }
                                          onMinus={() =>
                                            updateExtraQuantity(
                                              extra.key,
                                              -1,
                                            )
                                          }
                                          onPlus={() =>
                                            updateExtraQuantity(
                                              extra.key,
                                              1,
                                            )
                                          }
                                          disableMinus={
                                            extra.quantity <=
                                            0
                                          }
                                          disablePlus={
                                            maximum <=
                                              0 ||
                                            extra.quantity >=
                                              maximum
                                          }
                                        />
                                      </div>
                                    </div>
                                  </div>
                                );
                              },
                            )}
                          </div>
                        </div>
                      )}
                    </article>
                  );
                },
              )}
            </div>

            {/* TOTALS */}

            <div
              className="
                border-t
                border-white/[0.07]
                p-4

                sm:p-5
              "
            >
              <div
                className="
                  space-y-2.5
                  font-body
                  text-xs
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    text-white/35
                  "
                >
                  <span>
                    Sous-total
                  </span>

                  <strong
                    className="
                      font-subtitle
                      text-white/60
                    "
                  >
                    {formatMoney(
                      checkoutSubtotal,
                      locale,
                    )}
                  </strong>
                </div>

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    text-white/35
                  "
                >
                  <span>
                    Frais
                  </span>

                  <strong
                    className="
                      font-subtitle
                      text-white/60
                    "
                  >
                    {formatMoney(
                      checkoutServiceFee,
                      locale,
                    )}
                  </strong>
                </div>
              </div>

              <div
                className="
                  mt-4
                  flex
                  items-center
                  justify-between
                  border-t
                  border-white/[0.08]
                  pt-4
                "
              >
                <span
                  className="
                    font-title
                    text-xl
                    uppercase
                  "
                >
                  Total
                </span>

                <strong
                  className="
                    font-title
                    text-2xl

                    sm:text-3xl
                  "
                >
                  {formatMoney(
                    checkoutTotal,
                    locale,
                  )}
                </strong>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   PAYMENT SECTION
========================================================= */

type PaymentSectionProps = {
  accepted: boolean;

  setAccepted: (
    value: boolean,
  ) => void;

  error: string;
  loading: boolean;
  canSubmit: boolean;
  total: number;
  locale: string;
  acceptText: string;
  preparingText: string;
  showValidation: boolean;
};

function PaymentSection({
  accepted,
  setAccepted,
  error,
  loading,
  canSubmit,
  total,
  locale,
  acceptText,
  preparingText,
  showValidation,
}: PaymentSectionProps) {
  const acceptError =
    showValidation &&
    !accepted;

  return (
    <div className="pt-1">
      {/* CGV */}

      <div
        className={`
          rounded-[14px]
          border
          transition

          ${
            acceptError
              ? "border-red-500/45 bg-red-500/[0.04] p-3"
              : "border-transparent"
          }
        `}
      >
        <label
          className="
            flex
            cursor-pointer
            items-start
            gap-3
            py-1
          "
        >
          <input
            type="checkbox"
            checked={
              accepted
            }
            onChange={(
              event,
            ) =>
              setAccepted(
                event.target.checked,
              )
            }
            className="
              mt-0.5
              h-4
              w-4
              shrink-0
              accent-orange-400
              outline-none
              ring-0

              focus:outline-none
              focus:ring-0
            "
          />

          <span
            className={`
              font-body
              text-[11px]
              leading-5

              ${
                acceptError
                  ? "text-red-200/80"
                  : "text-white/40"
              }
            `}
          >
            {acceptText}
          </span>
        </label>
      </div>

      {/* ERROR */}

      {error && (
        <div
          className="
            mt-3
            rounded-[14px]
            border
            border-red-500/20
            bg-red-500/[0.07]
            px-4
            py-3
            font-body
            text-[11px]
            leading-5
            text-red-200
          "
        >
          {error}
        </div>
      )}

      {/* PAY */}

      <button
        type="submit"
        disabled={
          !canSubmit
        }
        className="
          group
          mt-3
          flex
          min-h-[54px]
          w-full
          items-center
          justify-center
          gap-3
          rounded-[16px]
          bg-secondary
          px-5
          font-subtitle
          text-sm
          text-black
          transition-all
          duration-300

          sm:min-h-[56px]

          hover:-translate-y-0.5
          hover:brightness-105

          disabled:cursor-not-allowed
          disabled:opacity-60
          disabled:hover:translate-y-0
        "
      >
        <span>
          {loading
            ? preparingText
            : `Payer ${formatMoney(
                total,
                locale,
              )}`}
        </span>

        {!loading && (
          <ArrowRight
            size={17}
            className="
              transition-transform
              duration-300
              group-hover:translate-x-1
            "
          />
        )}
      </button>
    </div>
  );
}