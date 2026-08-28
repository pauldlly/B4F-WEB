import {
  ArrowLeft,
  ArrowRight,
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

import type { GuestCustomer } from "../types";

const initialCustomer: GuestCustomer = {
  name: "",
  phoneCode: "+33",
  phone: "",
  email: "",
};

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

function getImageFromValue(
  value: unknown,
): string | null {
  if (
    typeof value === "string" &&
    value.trim()
  ) {
    return value;
  }

  const record =
    getRecord(value);

  if (!record) {
    return null;
  }

  const possibleValues = [
    record.url,
    record.uri,
    record.imageUrl,
    record.image_url,
    record.src,
  ];

  for (
    const possibleValue
    of possibleValues
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
    const event =
      getRecord(
        selectedEvent,
      );

    if (!event) {
      continue;
    }

    const eventCandidates = [
      event.imageUrl,
      event.image_url,
      event.image,
      event.eventImage,
      event.event_image,
      event.coverUrl,
      event.cover_url,
      event.thumbnail,
      event.thumbnailUrl,
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
    (selectedEvent) => {
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
    .replace(/\./g, "");
}

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

type QuantityControlProps = {
  value: number;
  onMinus: () => void;
  onPlus: () => void;
  disableMinus?: boolean;
  label?: string;
};

function QuantityControl({
  value,
  onMinus,
  onPlus,
  disableMinus = false,
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
          focus-visible:outline-none
          focus-visible:ring-0
          disabled:cursor-not-allowed
          disabled:text-white/10
          disabled:hover:bg-transparent
        "
        aria-label={
          value === 1
            ? "Supprimer le billet"
            : "Retirer un billet"
        }
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
          focus-visible:outline-none
          focus-visible:ring-0
        "
        aria-label="Ajouter un billet"
      >
        <Plus
          size={12}
          strokeWidth={2.5}
        />
      </button>
    </div>
  );
}

export function CheckoutPage() {
  const navigate =
    useNavigate();

  const affiliate =
    useAffiliate();

  const {
    user,
    openAuth,
  } = useAuth();

  const {
    items,
    subtotal,
    serviceFee,
    total,
    clear,
  } = useCart();

  const {
    saveOrder,
  } = useOrders();

  const {
    t,
    locale,
  } = useI18n();

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

  /*
   * Passe à true après
   * la première tentative
   * de paiement.
   */
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

  useEffect(() => {
    setCheckoutItems(
      items,
    );
  }, [items]);

  useEffect(() => {
    if (!user) {
      return;
    }

    setCustomer(
      (current) => ({
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
  }, [user]);

  const phoneValue =
    customer.phone
      ? `${customer.phoneCode}${customer.phone}`
      : "";

  /*
   * VALIDATION NOM
   */
  const nameValid =
    customer.name
      .trim()
      .length >= 2;

  /*
   * VALIDATION TÉLÉPHONE
   */
  const phoneValid =
    customer.phone
      .replace(
        /\D/g,
        "",
      )
      .length >= 6;

  /*
   * VALIDATION EMAIL
   */
  const emailValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      customer.email.trim(),
    );

  /*
   * CLIENT INVITÉ PRÊT
   */
  const guestReady =
    nameValid &&
    phoneValid &&
    emailValid;

  const checkoutSubtotal =
    useMemo(
      () =>
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
      [
        checkoutItems,
      ],
    );

  const checkoutTotal =
    useMemo(
      () =>
        Math.max(
          0,
          total +
            (
              checkoutSubtotal -
              subtotal
            ),
        ),
      [
        checkoutSubtotal,
        subtotal,
        total,
      ],
    );

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
                  .length === 0
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

            const itemRecord =
              getRecord(
                item,
              );

            const identity =
              itemRecord
                ? getStringField(
                    itemRecord,
                    [
                      "eventId",
                      "event_id",
                      "id",
                    ],
                  )
                : null;

            events.add(
              identity ||
                item.eventName ||
                item.key,
            );
          },
        );

        return events.size;
      },
      [
        checkoutItems,
      ],
    );

  /*
   * LE BOUTON RESTE CLIQUABLE
   * MÊME SI LE FORMULAIRE
   * N'EST PAS COMPLET.
   *
   * Cela permet d'afficher
   * les champs manquants en rouge.
   */
  const canSubmit =
    checkoutItems.length >
      0 &&
    !loading;

  const update = (
    field:
      keyof GuestCustomer,
    value: string,
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

  /*
   * TICKET SIMPLE
   *
   * 1 -> 0
   * = suppression
   */
  const updateEventQuantity = (
    key: string,
    delta: number,
  ) => {
    setCheckoutItems(
      (current) =>
        current.flatMap(
          (item) => {
            if (
              item.key !== key ||
              item.kind ===
                "pack"
            ) {
              return [
                item,
              ];
            }

            const nextQuantity =
              item.quantity +
              delta;

            if (
              nextQuantity <=
              0
            ) {
              return [];
            }

            return [
              {
                ...item,

                quantity:
                  nextQuantity,
              },
            ];
          },
        ),
    );

    setError("");
  };

  /*
   * PACK
   *
   * Si Homme + Femme = 0
   * => suppression du pack.
   */
  const updatePackQuantity = (
    key: string,

    gender:
      | "man"
      | "woman",

    delta: number,
  ) => {
    setCheckoutItems(
      (current) =>
        current.flatMap(
          (item) => {
            if (
              item.key !== key ||
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
        ),
    );

    setError("");
  };

  /*
   * PAIEMENT
   */
  const submit = async (
    event:
      FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    /*
     * À PARTIR DE CE CLIC,
     * ON MONTRE LES ERREURS
     * DES CHAMPS EN ROUGE.
     */
    setShowValidation(
      true,
    );

    /*
     * VALIDATION CLIENT INVITÉ
     */
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

    /*
     * VALIDATION CGV
     */
    if (!accepted) {
      setError(
        "Tu dois accepter les conditions avant de continuer.",
      );

      return;
    }

    /*
     * SÉCURITÉ
     */
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
                user
                  .user_metadata
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
            checkoutItems,
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

      navigate(
        `/commande/${result.order.id}?token=${encodeURIComponent(
          result.order
            .accessToken,
        )}&new=1`,
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

  /*
   * PANIER VIDE
   */
  if (
    checkoutItems.length ===
    0
  ) {
    return (
      <div className="page-shell pb-24 pt-36 text-center">
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#090909]">
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

      <div className="pointer-events-none absolute -left-64 top-0 h-[520px] w-[520px] rounded-full bg-secondary/[0.04] blur-[160px]" />

      <div className="pointer-events-none absolute -right-64 top-[380px] h-[500px] w-[500px] rounded-full bg-primary/[0.035] blur-[160px]" />

      <div className="page-shell relative pb-16 pt-28 sm:pb-20 sm:pt-32">

        {/* HEADER */}
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
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
                className="transition-transform duration-200 group-hover:-translate-x-0.5"
              />

              Retour
            </Link>

            <h1 className="mt-4 font-title text-4xl uppercase leading-[0.87] tracking-[-0.04em] sm:text-5xl">
              Ta commande.
            </h1>

            <p className="mt-1 font-body text-sm leading-6 text-white/35">
              Vérifie tes billets avant de passer au paiement.
            </p>
          </div>
        </div>

        <form
          onSubmit={
            submit
          }
          noValidate
          className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-start"
        >

          {/* CUSTOMER */}
          <section className="overflow-visible rounded-[28px] border border-white/[0.08] bg-[#111]">
            {!user ? (
              <div className="p-5 sm:p-7">

                {/* ACCOUNT */}
                <div className="rounded-[20px] border border-secondary/20 bg-secondary/[0.06] p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-secondary/10 text-secondary">
                        <UserRound
                          size={20}
                        />
                      </span>

                      <div>
                        <strong className="block font-subtitle text-sm">
                          Créer un compte B4F
                        </strong>

                        <span className="mt-1 block font-body text-[11px] text-white/30">
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
                      className="shrink-0 rounded-full bg-white px-5 py-2.5 font-subtitle text-[10px] uppercase tracking-[0.1em] text-black transition hover:bg-white/90"
                    >
                      Créer mon compte
                    </button>
                  </div>
                </div>

                {/* DIVIDER */}
                <div className="my-6 flex items-center gap-4">
                  <span className="h-px flex-1 bg-white/[0.08]" />

                  <span className="font-subtitle text-[9px] uppercase tracking-[0.18em] text-white/25">
                    ou continuer sans compte
                  </span>

                  <span className="h-px flex-1 bg-white/[0.08]" />
                </div>

                {/* FORM */}
                <div className="grid gap-4">

                  {/* NAME */}
                  <label>
                    <span className="mb-2 block font-subtitle text-xs">
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
                      placeholder="Lionel Geko"
                      autoComplete="name"
                    />

                    {showValidation &&
                      !nameValid && (
                        <p className="mt-2 font-body text-[10px] leading-4 text-red-400">
                          Renseigne ton nom.
                        </p>
                      )}
                  </label>

                  {/* PHONE */}
                  <div className="min-w-0">
                    <span className="mb-2 block font-subtitle text-xs">
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
                        transition

                        ${
                          showValidation &&
                          !phoneValid
                            ? "border-red-500/70 bg-red-500/[0.04]"
                            : "border-white/[0.09] hover:border-white/15 focus-within:border-white/20"
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
                        <p className="mt-2 font-body text-[10px] leading-4 text-red-400">
                          Renseigne un numéro de téléphone valide.
                        </p>
                      )}
                  </div>

                  {/* EMAIL */}
                  <label>
                    <span className="mb-2 block font-subtitle text-xs">
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
                        focus-visible:outline-none
                        focus-visible:ring-0

                        ${
                          showValidation &&
                          !emailValid
                            ? "border-red-500/70 bg-red-500/[0.04]"
                            : "border-white/[0.09] hover:border-white/15 focus:border-white/20"
                        }
                      `}
                      type="email"
                      placeholder="lionel.geko@gmail.com"
                      autoComplete="email"
                    />

                    {showValidation &&
                      !emailValid && (
                        <p className="mt-2 font-body text-[10px] leading-4 text-red-400">
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

                {/* CONNECTED */}
                <div className="flex items-center gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-green-500/10 text-green-400">
                    <CheckCircle2
                      size={20}
                    />
                  </span>

                  <div className="min-w-0">
                    <span className="font-subtitle text-[9px] uppercase tracking-[0.18em] text-green-400">
                      Compte connecté
                    </span>

                    <strong className="mt-1 block truncate font-subtitle text-sm text-white/80">
                      {user.user_metadata
                        ?.full_name ||
                        user.email ||
                        "Compte B4F"}
                    </strong>

                    {user.email && (
                      <span className="mt-1 block truncate font-body text-[11px] text-white/30">
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

          {/* SUMMARY */}
          <aside className="h-fit overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#111] lg:sticky lg:top-28">

            {/* SUMMARY HEADER */}
            <div className="border-b border-white/[0.07] px-5 py-5">
              <div className="flex w-full items-center justify-between gap-3">
                <h2 className="whitespace-nowrap font-title text-2xl uppercase leading-none">
                  Récapitulatif
                </h2>

                <span className="shrink-0 whitespace-nowrap rounded-full border border-white/[0.07] bg-[#151515] px-3 py-1.5 font-subtitle text-[9px] uppercase tracking-[0.1em] text-white/35">
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
            <div className="custom-scrollbar max-h-[58vh] space-y-2 overflow-y-auto p-3">
              {checkoutItems.map(
                (item) => {
                  const image =
                    getCartItemImage(
                      item,
                    );

                  const dates =
                    getCartItemDates(
                      item,
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
                        group
                        rounded-[17px]
                        border
                        border-white/[0.07]
                        bg-[#151515]
                        p-3
                        transition-colors
                        duration-200
                        hover:border-white/[0.11]
                      "
                    >
                      <div className="grid grid-cols-[68px_minmax(0,1fr)] items-center gap-3">

                        {/* IMAGE */}
                        <div className="relative h-[68px] w-[68px] overflow-hidden rounded-[12px] bg-[#0f0f0f]">
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
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                            />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-white/20">
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
                        <div className="min-w-0 translate-y-[2px]">

                          {/* TOP */}
                          <div className="flex items-center justify-between gap-3">

                            {/* TYPE */}
                            <span className="inline-flex min-w-0 items-center gap-1.5 font-subtitle text-[9px] uppercase tracking-[0.1em] text-secondary">
                              {item.kind ===
                              "pack" ? (
                                <Package
                                  size={10}
                                  className="shrink-0"
                                />
                              ) : (
                                <Ticket
                                  size={10}
                                  className="shrink-0"
                                />
                              )}

                              <span className="truncate">
                                {amount}{" "}

                                {item.kind ===
                                "pack"
                                  ? amount > 1
                                    ? "packs"
                                    : "pack"
                                  : amount > 1
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
                            </span>

                            {/* PRICE */}
                            <strong className="shrink-0 font-subtitle text-[14px] text-white">
                              {formatMoney(
                                getCartItemTotal(
                                  item,
                                ),
                                locale,
                              )}
                            </strong>
                          </div>

                          {/* NAME */}
                          <strong className="mt-1.5 block truncate font-subtitle text-[13px] text-white/90">
                            {item.kind ===
                            "pack"
                              ? item.packName
                              : item.eventName}
                          </strong>

                          {/* BOTTOM */}
                          <div className="mt-2 flex min-h-[32px] items-center justify-between gap-3">

                            {/* DATE */}
                            <div className="flex min-w-0 items-center gap-1.5">
                              {dates.length >
                                0 && (
                                <>
                                  <CalendarDays
                                    size={11}
                                    className="shrink-0 text-white/30"
                                  />

                                  <span className="truncate font-body text-[9px] text-white/35">
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

                            {/* EVENT QUANTITY */}
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
                              />
                            )}

                            {/* PACK QUANTITY */}
                            {item.kind ===
                              "pack" && (
                              <div className="flex shrink-0 gap-1">

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
                    </article>
                  );
                },
              )}
            </div>

            {/* TOTAL */}
            <div className="border-t border-white/[0.07] p-5">
              <div className="space-y-2.5 font-body text-xs">

                <div className="flex items-center justify-between text-white/35">
                  <span>
                    {t(
                      "common.subtotal",
                    )}
                  </span>

                  <strong className="font-subtitle text-white/60">
                    {formatMoney(
                      checkoutSubtotal,
                      locale,
                    )}
                  </strong>
                </div>

                <div className="flex items-center justify-between text-white/35">
                  <span>
                    {t(
                      "common.fees",
                    )}
                  </span>

                  <strong className="font-subtitle text-white/60">
                    {formatMoney(
                      serviceFee,
                      locale,
                    )}
                  </strong>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/[0.08] pt-4">
                <span className="font-title text-xl uppercase">
                  Total
                </span>

                <strong className="font-title text-3xl">
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
        <label className="flex cursor-pointer items-start gap-3 py-1">
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
          min-h-[56px]
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
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        )}
      </button>
    </div>
  );
}