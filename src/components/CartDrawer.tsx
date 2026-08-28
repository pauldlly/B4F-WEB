import {
  ArrowRight,
  CalendarDays,
  CalendarRange,
  ImageIcon,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { useI18n } from "../i18n/LanguageProvider";

import {
  formatEventDate,
  formatMoney,
} from "../lib/format";

import {
  getCartItemTotal,
  useCart,
} from "../providers/CartProvider";

import { QuantityInput } from "./QuantityInput";

export function CartDrawer() {
  const navigate =
    useNavigate();

  const {
    t,
    locale,
  } = useI18n();

  const {
    open,
    setOpen,
    items,
    subtotal,
    serviceFee,
    total,
    updateEventQuantity,
    updatePackGenderQuantity,
    removeItem,
  } = useCart();

  useBodyScrollLock(
    open,
  );

  return (
    <>
      {/* BACKDROP */}
      <button
        type="button"
        aria-label={t(
          "common.close",
        )}
        onClick={() =>
          setOpen(false)
        }
        className={`fixed inset-0 z-[70] bg-black/[0.72] backdrop-blur-md transition ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* CART DRAWER */}
      <aside
        className={`fixed inset-0 z-[75] flex flex-col overflow-hidden bg-[#151515] shadow-2xl transition-transform duration-300 sm:bottom-3 sm:left-auto sm:right-3 sm:top-3 sm:w-[min(460px,calc(100%-24px))] sm:rounded-[30px] sm:border sm:border-white/10 ${
          open
            ? "translate-x-0"
            : "translate-x-full sm:translate-x-[calc(100%+24px)]"
        }`}
      >
        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/[0.07] px-4 py-4 sm:p-5">
          <div>
            <span className="eyebrow">
              {t(
                "cart.selection",
              )}
            </span>

            <h2 className="font-title text-2xl uppercase">
              {t(
                "cart.title",
              )}
            </h2>
          </div>

          <button
            type="button"
            onClick={() =>
              setOpen(false)
            }
            className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label={t(
              "common.close",
            )}
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">
          {items.length ===
          0 ? (
            /* EMPTY CART */
            <div className="grid min-h-full place-items-center py-16 text-center">
              <div>
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-white/10 bg-white/5 text-white/20">
                  <ShoppingBag
                    size={30}
                  />
                </span>

                <h3 className="mt-5 font-title text-xl uppercase">
                  {t(
                    "cart.empty",
                  )}
                </h3>

                <p className="mt-2 font-body text-sm text-white/40">
                  {t(
                    "cart.emptyText",
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(
                (item) => {
                  const title =
                    item.kind ===
                    "pack"
                      ? item.packName
                      : item.eventName;

                  const imageUrl =
                    item.imageUrl;

                  return (
                    <article
                      key={
                        item.key
                      }
                      className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-background"
                    >
                      {/* TOP */}
                      <div className="flex gap-3 p-3">

                        {/* IMAGE */}
                        <div className="relative h-[92px] w-[92px] shrink-0 overflow-hidden rounded-[18px] bg-black/25">
                          {imageUrl ? (
                            <img
                              src={
                                imageUrl
                              }
                              alt={
                                title
                              }
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="grid h-full w-full place-items-center bg-gradient-to-br from-secondary/25 to-primary/20 text-white/30">
                              <ImageIcon
                                size={
                                  23
                                }
                              />
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-black/[0.45] to-transparent" />
                        </div>

                        {/* INFO */}
                        <div className="min-w-0 flex-1 py-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <span className="font-subtitle text-[9px] uppercase tracking-[0.16em] text-secondary">
                                {item.kind ===
                                "pack"
                                  ? "B4F Pack"
                                  : item.gender ===
                                      "woman"
                                    ? t(
                                        "common.women",
                                      )
                                    : t(
                                        "common.men",
                                      )}
                              </span>

                              <h3 className="mt-1 line-clamp-2 font-subtitle text-sm leading-5">
                                {
                                  title
                                }
                              </h3>

                              {/* EVENT DATE */}
                              {item.kind ===
                                "event" && (
                                <p className="mt-2 flex items-center gap-1.5 font-body text-[11px] leading-4 text-white/[0.35]">
                                  <CalendarDays
                                    size={
                                      13
                                    }
                                    className="shrink-0 text-secondary"
                                  />

                                  {formatEventDate(
                                    item.eventDate,
                                    item.startTime,
                                    {
                                      locale,
                                      includeYear:
                                        false,
                                    },
                                  )}
                                </p>
                              )}

                              {/* PACK EVENTS COUNT */}
                              {item.kind ===
                                "pack" && (
                                <p className="mt-2 flex items-center gap-1.5 font-body text-[11px] text-white/[0.35]">
                                  <CalendarRange
                                    size={
                                      13
                                    }
                                    className="shrink-0"
                                  />

                                  {
                                    item
                                      .selectedEvents
                                      .length
                                  }{" "}
                                  {t(
                                    "nav.events",
                                  ).toLowerCase()}
                                </p>
                              )}
                            </div>

                            {/* DELETE */}
                            <button
                              type="button"
                              onClick={() =>
                                removeItem(
                                  item.key,
                                )
                              }
                              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/5 text-white/[0.35] transition hover:bg-red-500/10 hover:text-red-300"
                              aria-label="Supprimer"
                            >
                              <Trash2
                                size={
                                  15
                                }
                              />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* EXTRAS */}
                      {item.extras
                        .length >
                        0 && (
                        <div className="mx-3 space-y-1 border-t border-white/[0.07] py-3 font-body text-xs text-white/[0.38]">
                          {item.extras.map(
                            (
                              extra,
                            ) => (
                              <p
                                key={
                                  extra.key
                                }
                              >
                                {
                                  extra.quantity
                                }{" "}
                                ×{" "}
                                {
                                  extra.name
                                }
                              </p>
                            ),
                          )}
                        </div>
                      )}

                      {/* ========================
                          EVENT
                      ========================= */}
                      {item.kind ===
                      "event" ? (
                        <div className="flex items-center justify-between gap-3 border-t border-white/[0.07] p-3">
                          <QuantityInput
                            value={
                              item.quantity
                            }
                            minimum={
                              0
                            }
                            maximum={
                              item.maximumAvailable
                            }
                            compact
                            onChange={(
                              quantity,
                            ) => {
                              /*
                               * QUANTITÉ 0
                               * =
                               * SUPPRESSION
                               */
                              if (
                                quantity ===
                                0
                              ) {
                                removeItem(
                                  item.key,
                                );

                                return;
                              }

                              updateEventQuantity(
                                item.key,
                                quantity,
                              );
                            }}
                          />

                          <strong className="font-subtitle">
                            {formatMoney(
                              getCartItemTotal(
                                item,
                              ),
                              locale,
                            )}
                          </strong>
                        </div>
                      ) : (
                        /* ========================
                            PACK
                        ========================= */
                        <div className="space-y-2 border-t border-white/[0.07] p-3">

                          {/* ====================
                              HOMME
                              AFFICHÉ UNIQUEMENT
                              SI SÉLECTIONNÉ
                          ===================== */}
                          {item.maleQuantity >
                            0 && (
                            <div className="flex items-center justify-between gap-3 rounded-2xl border border-secondary/[0.08] bg-black/20 p-3">
                              <div>
                                <span className="block font-body text-sm text-yellow-100">
                                  {t(
                                    "pack.malePack",
                                  )}
                                </span>

                                <span className="mt-0.5 block font-body text-[9px] uppercase tracking-[0.08em] text-white/25">
                                  Homme
                                </span>
                              </div>

                              <QuantityInput
                                value={
                                  item.maleQuantity
                                }
                                minimum={
                                  0
                                }
                                maximum={
                                  item.maleMaximumAvailable
                                }
                                compact
                                onChange={(
                                  quantity,
                                ) => {
                                  /*
                                   * HOMME À 0
                                   *
                                   * SI FEMME EST AUSSI 0
                                   * => SUPPRESSION DU PACK
                                   */
                                  if (
                                    quantity ===
                                      0 &&
                                    item.femaleQuantity ===
                                      0
                                  ) {
                                    removeItem(
                                      item.key,
                                    );

                                    return;
                                  }

                                  updatePackGenderQuantity(
                                    item.key,
                                    "man",
                                    quantity,
                                  );
                                }}
                              />
                            </div>
                          )}

                          {/* ====================
                              FEMME
                              AFFICHÉE UNIQUEMENT
                              SI SÉLECTIONNÉE
                          ===================== */}
                          {item.femaleQuantity >
                            0 && (
                            <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#ff4f9a]/[0.08] bg-black/20 p-3">
                              <div>
                                <span className="block font-body text-sm text-pink-100">
                                  {t(
                                    "pack.femalePack",
                                  )}
                                </span>

                                <span className="mt-0.5 block font-body text-[9px] uppercase tracking-[0.08em] text-white/25">
                                  Femme
                                </span>
                              </div>

                              <QuantityInput
                                value={
                                  item.femaleQuantity
                                }
                                minimum={
                                  0
                                }
                                maximum={
                                  item.femaleMaximumAvailable
                                }
                                compact
                                onChange={(
                                  quantity,
                                ) => {
                                  /*
                                   * FEMME À 0
                                   *
                                   * SI HOMME EST AUSSI 0
                                   * => SUPPRESSION DU PACK
                                   */
                                  if (
                                    quantity ===
                                      0 &&
                                    item.maleQuantity ===
                                      0
                                  ) {
                                    removeItem(
                                      item.key,
                                    );

                                    return;
                                  }

                                  updatePackGenderQuantity(
                                    item.key,
                                    "woman",
                                    quantity,
                                  );
                                }}
                              />
                            </div>
                          )}

                          {/* PACK PRICE */}
                          <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
                            <span className="font-body text-[10px] uppercase tracking-[0.08em] text-white/25">
                              Total pack
                            </span>

                            <strong className="font-subtitle">
                              {formatMoney(
                                getCartItemTotal(
                                  item,
                                ),
                                locale,
                              )}
                            </strong>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                },
              )}
            </div>
          )}
        </div>

        {/* ========================
            TOTAL + CHECKOUT
        ========================= */}
        {items.length >
          0 && (
          <div className="shrink-0 border-t border-white/[0.07] bg-[#151515] p-4 sm:p-5">
            <div className="space-y-3 font-body text-sm">

              {/* SUBTOTAL */}
              <div className="flex justify-between text-white/[0.45]">
                <span>
                  {t(
                    "common.subtotal",
                  )}
                </span>

                <strong className="font-subtitle text-white">
                  {formatMoney(
                    subtotal,
                    locale,
                  )}
                </strong>
              </div>

              {/* FEES */}
              <div className="flex justify-between text-white/[0.45]">
                <span>
                  {t(
                    "common.fees",
                  )}
                </span>

                <strong className="font-subtitle text-white">
                  {formatMoney(
                    serviceFee,
                    locale,
                  )}
                </strong>
              </div>

              {/* TOTAL */}
              <div className="flex justify-between border-t border-white/[0.07] pt-4 text-lg">
                <span className="font-subtitle">
                  {t(
                    "common.total",
                  )}
                </span>

                <strong className="font-title">
                  {formatMoney(
                    total,
                    locale,
                  )}
                </strong>
              </div>
            </div>

            {/* CHECKOUT */}
            <button
              type="button"
              onClick={() => {
                setOpen(false);

                navigate(
                  "/checkout",
                );
              }}
              className="primary-button mt-5 w-full"
            >
              {t(
                "common.checkout",
              )}

              <ArrowRight
                size={19}
              />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}