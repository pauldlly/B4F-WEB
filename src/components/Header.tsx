import {
  ArrowRight,
  CircleHelp,
  Menu,
  ShoppingBag,
  Ticket,
  UserRound,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { createPortal } from "react-dom";

import {
  Link,
  NavLink,
  useLocation,
} from "react-router-dom";

import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { useI18n } from "../i18n/LanguageProvider";
import { useAuth } from "../providers/AuthProvider";
import { useCart } from "../providers/CartProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";

/* =========================================================
   ROUTES TRANSPARENTES
========================================================= */

const transparentRoutes = new Set([
  "/",
  "/events",
  "/packs",
  "/barcelona",
  "/rejoindre",
  "/aide",
]);

/* =========================================================
   HEADER
========================================================= */

export function Header() {
  const location = useLocation();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [scrolled, setScrolled] =
    useState(false);

  const [mounted, setMounted] =
    useState(false);

  const {
    count,
    setOpen,
  } = useCart();

  const {
    user,
    loading,
    openAuth,
  } = useAuth();

  const {
    t,
  } = useI18n();

  /* =======================================================
     MOUNT
  ======================================================= */

  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  /* =======================================================
     LOCK BODY QUAND MENU MOBILE OUVERT
  ======================================================= */

  useBodyScrollLock(menuOpen);

  /* =======================================================
     SCROLL HEADER
  ======================================================= */

  useEffect(() => {
    let frame = 0;

    const getScrollPosition = () =>
      Math.max(
        window.scrollY || 0,
        window.pageYOffset || 0,
        document.documentElement
          .scrollTop || 0,
        document.body.scrollTop || 0,
      );

    const updateHeader = () => {
      cancelAnimationFrame(frame);

      frame =
        requestAnimationFrame(() => {
          setScrolled(
            getScrollPosition() >
              20,
          );
        });
    };

    updateHeader();

    window.addEventListener(
      "scroll",
      updateHeader,
      {
        passive: true,
      },
    );

    window.addEventListener(
      "touchmove",
      updateHeader,
      {
        passive: true,
      },
    );

    window.addEventListener(
      "resize",
      updateHeader,
      {
        passive: true,
      },
    );

    window.visualViewport?.addEventListener(
      "scroll",
      updateHeader,
    );

    window.visualViewport?.addEventListener(
      "resize",
      updateHeader,
    );

    return () => {
      cancelAnimationFrame(
        frame,
      );

      window.removeEventListener(
        "scroll",
        updateHeader,
      );

      window.removeEventListener(
        "touchmove",
        updateHeader,
      );

      window.removeEventListener(
        "resize",
        updateHeader,
      );

      window.visualViewport?.removeEventListener(
        "scroll",
        updateHeader,
      );

      window.visualViewport?.removeEventListener(
        "resize",
        updateHeader,
      );
    };
  }, []);

  /* =======================================================
     FERME MENU AU CHANGEMENT DE PAGE
  ======================================================= */

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  /* =======================================================
     ESC POUR FERMER MENU
  ======================================================= */

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key ===
        "Escape"
      ) {
        setMenuOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [menuOpen]);

  /* =======================================================
     HEADER TRANSPARENT
  ======================================================= */

  const transparent =
    transparentRoutes.has(
      location.pathname,
    ) && !scrolled;

  /* =======================================================
     LINKS
  ======================================================= */

  const desktopLinks =
    useMemo(
      () => [
        {
          to: "/events",
          label: t(
            "nav.events",
          ),
        },

        {
          to: "/packs",
          label: t(
            "nav.packs",
          ),
        },

        {
          to: "/rejoindre",
          label: "Jobs",
        },
      ],
      [t],
    );

  const mobileMain =
    desktopLinks;

  const mobileSecondary = [
    {
      to: "/mes-billets",

      label: t(
        "nav.tickets",
      ),

      icon: Ticket,
    },

    {
      to: "/aide",

      label: "Aide",

      icon: CircleHelp,
    },
  ];

  /* =======================================================
     OPEN CART
  ======================================================= */

  const openCart = () => {
    /*
     * Important :
     * évite que le menu burger et
     * le panier soient ouverts
     * en même temps.
     */
    setMenuOpen(false);

    setOpen(true);
  };

  /* =======================================================
     MOBILE MENU
  ======================================================= */

  const mobileMenu =
    menuOpen &&
    mounted &&
    typeof document !==
      "undefined"
      ? createPortal(
          <div
            className="
              fixed
              inset-0
              z-[1000]
              h-[100dvh]
              w-screen
              overflow-hidden
              bg-[#080808]
              lg:hidden
            "
            role="dialog"
            aria-modal="true"
            aria-label={t(
              "nav.menu",
            )}
          >
            {/* =============================================
                BACKGROUND
            ============================================== */}

            <div
              className="
                pointer-events-none
                absolute
                inset-0
                overflow-hidden
              "
            >
              {/* PINK GLOW */}

              <div
                className="
                  absolute
                  -right-28
                  -top-28
                  h-[340px]
                  w-[340px]
                  rounded-full
                  bg-primary/[0.10]
                  blur-[115px]
                "
              />

              {/* ORANGE GLOW */}

              <div
                className="
                  absolute
                  -bottom-32
                  -left-28
                  h-[350px]
                  w-[350px]
                  rounded-full
                  bg-secondary/[0.10]
                  blur-[120px]
                "
              />

              {/* LIGHT */}

              <div
                className="
                  absolute
                  inset-0
                  bg-[linear-gradient(155deg,rgba(255,255,255,.025),transparent_35%)]
                "
              />

              {/* B4F GHOST */}

              <img
                src="/brand/b4f-mark-gradient.png"
                alt=""
                aria-hidden="true"
                className="
                  absolute
                  -bottom-10
                  -right-20
                  w-[300px]
                  max-w-none
                  opacity-[0.035]
                "
              />
            </div>

            {/* =============================================
                CONTENT
            ============================================== */}

            <div
              className="
                custom-scrollbar
                relative
                mx-auto
                flex
                h-[100dvh]
                w-full
                max-w-[1440px]
                flex-col
                overflow-x-hidden
                overflow-y-auto
                px-4
                pb-[max(16px,env(safe-area-inset-bottom))]
                pt-[max(12px,env(safe-area-inset-top))]
                sm:px-6
                sm:pb-5
                sm:pt-4
              "
            >
              {/* ===========================================
                  MOBILE HEADER
              ============================================ */}

              <div
                className="
                  flex
                  min-h-[56px]
                  shrink-0
                  items-center
                  justify-between
                  gap-4
                "
              >
                <Link
                  to="/"
                  onClick={() =>
                    setMenuOpen(
                      false,
                    )
                  }
                  className="shrink-0"
                  aria-label="B4F EVENTS"
                >
                  <img
                    src="/brand/b4f-header-white.png"
                    alt="B4F Events Barcelona"
                    className="
                      h-[50px]
                      w-[82px]
                      object-contain
                      object-left
                    "
                  />
                </Link>

                <button
                  type="button"
                  onClick={() =>
                    setMenuOpen(
                      false,
                    )
                  }
                  className="
                    grid
                    h-11
                    w-11
                    shrink-0
                    place-items-center
                    rounded-full
                    border
                    border-white/[0.10]
                    bg-white/[0.05]
                    text-white/70
                    outline-none
                    ring-0
                    transition
                    hover:border-white/20
                    hover:bg-white/[0.08]
                    hover:text-white
                    focus:outline-none
                    focus:ring-0
                  "
                  aria-label={t(
                    "common.close",
                  )}
                >
                  <X
                    size={20}
                  />
                </button>
              </div>

              {/* ===========================================
                  INTRO
              ============================================ */}

              <div
                className="
                  mt-8
                  shrink-0
                "
              >
                <h2
                  className="
                    mt-2
                    font-title
                    text-[30px]
                    uppercase
                    leading-[0.90]
                    tracking-[-0.035em]
                    text-white
                  "
                >
                  Où veux-tu
                  <br />

                  <span
                    className="
                      bg-gradient-to-r
                      from-secondary
                      to-primary
                      bg-clip-text
                      text-transparent
                    "
                  >
                    aller ?
                  </span>
                </h2>
              </div>

              {/* ===========================================
                  MAIN NAV
              ============================================ */}

              <nav
                className="
                  mt-7
                  space-y-2.5
                "
              >
                {mobileMain.map(
                  (
                    item,
                    index,
                  ) => (
                    <NavLink
                      key={
                        item.to
                      }
                      to={
                        item.to
                      }
                      onClick={() =>
                        setMenuOpen(
                          false,
                        )
                      }
                      className={({
                        isActive,
                      }) =>
                        `
                          group
                          flex
                          min-h-[70px]
                          w-full
                          items-center
                          gap-3.5
                          rounded-[19px]
                          border
                          px-3.5
                          transition-all
                          duration-300

                          ${
                            isActive
                              ? "border-secondary/30 bg-secondary/[0.07]"
                              : "border-white/[0.075] bg-[#111]/90 hover:border-white/[0.14] hover:bg-[#141414]"
                          }
                        `
                      }
                    >
                      {({
                        isActive,
                      }) => (
                        <>
                          {/* NUMBER */}

                          <span
                            className={`
                              grid
                              h-9
                              w-9
                              shrink-0
                              place-items-center
                              rounded-[11px]
                              font-subtitle
                              text-[9px]
                              transition

                              ${
                                isActive
                                  ? "bg-secondary text-black"
                                  : "bg-white/[0.045] text-secondary"
                              }
                            `}
                          >
                            {String(
                              index +
                                1,
                            ).padStart(
                              2,
                              "0",
                            )}
                          </span>

                          {/* LABEL */}

                          <span
                            className="
                              min-w-0
                              flex-1
                              font-title
                              text-[24px]
                              uppercase
                              leading-none
                              tracking-[-0.025em]
                              text-white
                            "
                          >
                            {
                              item.label
                            }
                          </span>

                          {/* ARROW */}

                          <span
                            className={`
                              grid
                              h-9
                              w-9
                              shrink-0
                              place-items-center
                              rounded-full
                              border
                              transition-all

                              ${
                                isActive
                                  ? "border-secondary/25 bg-secondary/[0.08] text-secondary"
                                  : "border-white/[0.07] bg-white/[0.025] text-white/25 group-hover:border-white/15 group-hover:text-white/70"
                              }
                            `}
                          >
                            <ArrowRight
                              size={
                                15
                              }
                              className="
                                transition-transform
                                duration-300
                                group-hover:translate-x-0.5
                              "
                            />
                          </span>
                        </>
                      )}
                    </NavLink>
                  ),
                )}
              </nav>

              {/* ===========================================
                  BOTTOM
              ============================================ */}

              <div
                className="
                  mt-auto
                  shrink-0
                  pt-7
                "
              >
                <div
                  className="
                    border-t
                    border-white/[0.07]
                    pt-4
                  "
                >
                  {/* =======================================
                      SECONDARY
                  ======================================== */}

                  <div className="grid grid-cols-2 gap-2">
                    {mobileSecondary.map(
                      (
                        item,
                      ) => {
                        const Icon =
                          item.icon;

                        return (
                          <Link
                            key={
                              item.to
                            }
                            to={
                              item.to
                            }
                            onClick={() =>
                              setMenuOpen(
                                false,
                              )
                            }
                            className="
                              group
                              flex
                              min-h-[50px]
                              min-w-0
                              items-center
                              gap-2.5
                              rounded-[15px]
                              border
                              border-white/[0.07]
                              bg-[#111]/90
                              px-3
                              font-subtitle
                              text-[10px]
                              text-white/55
                              transition
                              hover:border-white/[0.15]
                              hover:bg-[#141414]
                              hover:text-white
                            "
                          >
                            <span
                              className="
                                grid
                                h-7
                                w-7
                                shrink-0
                                place-items-center
                                rounded-[9px]
                                bg-secondary/[0.07]
                                text-secondary
                              "
                            >
                              <Icon
                                size={
                                  14
                                }
                              />
                            </span>

                            <span className="truncate">
                              {
                                item.label
                              }
                            </span>
                          </Link>
                        );
                      },
                    )}
                  </div>

                  {/* =======================================
                      ACCOUNT
                  ======================================== */}

                  <div className="mt-2.5">
                    {user ? (
                      <Link
                        to="/compte"
                        onClick={() =>
                          setMenuOpen(
                            false,
                          )
                        }
                        className="
                          group
                          flex
                          min-h-[54px]
                          w-full
                          items-center
                          justify-between
                          rounded-[17px]
                          bg-secondary
                          px-4
                          font-subtitle
                          text-[11px]
                          uppercase
                          tracking-[0.08em]
                          text-black
                          transition
                          hover:brightness-105
                        "
                      >
                        <span className="flex items-center gap-2.5">
                          <UserRound
                            size={
                              17
                            }
                          />

                          {t(
                            "nav.account",
                          )}
                        </span>

                        <ArrowRight
                          size={
                            16
                          }
                          className="
                            transition-transform
                            duration-300
                            group-hover:translate-x-0.5
                          "
                        />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled={
                          loading
                        }
                        onClick={() => {
                          setMenuOpen(
                            false,
                          );

                          openAuth(
                            "login",
                          );
                        }}
                        className="
                          group
                          flex
                          min-h-[54px]
                          w-full
                          items-center
                          justify-between
                          rounded-[17px]
                          bg-secondary
                          px-4
                          font-subtitle
                          text-[11px]
                          uppercase
                          tracking-[0.08em]
                          text-black
                          outline-none
                          ring-0
                          transition
                          hover:brightness-105
                          focus:outline-none
                          focus:ring-0
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >
                        <span className="flex items-center gap-2.5">
                          <UserRound
                            size={
                              17
                            }
                          />

                          {t(
                            "nav.login",
                          )}
                        </span>

                        <ArrowRight
                          size={
                            16
                          }
                          className="
                            transition-transform
                            duration-300
                            group-hover:translate-x-0.5
                          "
                        />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <header
        className={`
          fixed
          left-0
          right-0
          top-0
          z-40
          w-full
          transition-[background-color,border-color,box-shadow]
          duration-300

          ${
            transparent
              ? `
                border-b
                border-white/[0.06]
                bg-[#090909]/[0.94]
                shadow-[0_8px_35px_rgba(0,0,0,.25)]

                lg:border-transparent
                lg:bg-gradient-to-b
                lg:from-black/80
                lg:via-black/30
                lg:to-transparent
                lg:shadow-none
              `
              : `
                border-b
                border-white/[0.07]
                bg-[#090909]/[0.96]
                shadow-[0_16px_55px_rgba(0,0,0,.35)]

                lg:bg-[#090909]/[0.92]
                lg:backdrop-blur-2xl
              `
          }
        `}
      >
        {/* =================================================
            HEADER BAR
        ================================================= */}

        <div
          className="
            page-shell
            flex
            h-[64px]
            w-full
            items-center
            justify-between
            gap-2
            sm:h-[72px]
            sm:gap-3
          "
        >
          {/* ===============================================
              LOGO
          ================================================ */}

          <Link
            to="/"
            className="
              relative
              z-10
              shrink-0
            "
            aria-label="B4F EVENTS"
          >
            <img
              src="/brand/b4f-header-white.png"
              alt="B4F Events Barcelona"
              className="
                h-[44px]
                w-[70px]
                object-contain
                object-left
                sm:h-[58px]
                sm:w-[90px]
              "
            />
          </Link>

          {/* ===============================================
              DESKTOP NAV
          ================================================ */}

          <nav
            className="
              absolute
              left-1/2
              hidden
              -translate-x-1/2
              items-center
              gap-10
              lg:flex
            "
          >
            {desktopLinks.map(
              (
                item,
              ) => (
                <NavLink
                  key={
                    item.to
                  }
                  to={
                    item.to
                  }
                  className={({
                    isActive,
                  }) =>
                    `
                      group
                      relative
                      py-3
                      font-subtitle
                      text-[14px]
                      uppercase
                      tracking-[0.10em]
                      transition-all
                      duration-300

                      ${
                        isActive
                          ? "text-white"
                          : "text-white/60 hover:text-white"
                      }
                    `
                  }
                >
                  {({
                    isActive,
                  }) => (
                    <>
                      {
                        item.label
                      }

                      <span
                        className={`
                          absolute
                          inset-x-0
                          bottom-1
                          h-[2px]
                          origin-left
                          rounded-full
                          bg-gradient-to-r
                          from-secondary
                          to-primary
                          transition-transform
                          duration-300

                          ${
                            isActive
                              ? "scale-x-100"
                              : "scale-x-0 group-hover:scale-x-100"
                          }
                        `}
                      />
                    </>
                  )}
                </NavLink>
              ),
            )}
          </nav>

          {/* ===============================================
              RIGHT
          ================================================ */}

          <div
            className="
              relative
              z-10
              flex
              min-w-0
              shrink-0
              items-center
              gap-1
              sm:gap-2
            "
          >
            {/* =============================================
                LANGUAGE
            ============================================== */}

            <div className="min-w-0">
              <LanguageSwitcher />
            </div>

            {/* =============================================
                TICKETS DESKTOP
            ============================================== */}

            <Link
              to="/mes-billets"
              className="
                hidden
                h-11
                w-11
                shrink-0
                place-items-center
                rounded-full
                border
                border-white/10
                bg-black/20
                text-white/[0.65]
                backdrop-blur-xl
                transition
                hover:border-secondary/35
                hover:text-white
                lg:grid
              "
              aria-label={t(
                "nav.tickets",
              )}
            >
              <Ticket
                size={18}
              />
            </Link>

            {/* =============================================
                ACCOUNT DESKTOP
            ============================================== */}

            {user ? (
              <Link
                to="/compte"
                className="
                  hidden
                  h-11
                  w-11
                  shrink-0
                  place-items-center
                  rounded-full
                  border
                  border-white/10
                  bg-black/20
                  text-white/[0.65]
                  backdrop-blur-xl
                  transition
                  hover:border-white/25
                  hover:text-white
                  lg:grid
                "
                aria-label={t(
                  "nav.account",
                )}
              >
                <UserRound
                  size={
                    18
                  }
                />
              </Link>
            ) : (
              <button
                type="button"
                disabled={
                  loading
                }
                onClick={() =>
                  openAuth(
                    "login",
                  )
                }
                className="
                  hidden
                  h-11
                  w-11
                  shrink-0
                  place-items-center
                  rounded-full
                  border
                  border-white/10
                  bg-black/20
                  text-white/[0.65]
                  backdrop-blur-xl
                  transition
                  hover:border-white/25
                  hover:text-white
                  disabled:opacity-50
                  lg:grid
                "
                aria-label={t(
                  "nav.login",
                )}
              >
                <UserRound
                  size={
                    18
                  }
                />
              </button>
            )}

            {/* =============================================
                CART
            ============================================== */}

            <button
              type="button"
              onClick={
                openCart
              }
              className="
                relative
                z-10
                grid
                h-10
                w-10
                shrink-0
                place-items-center
                rounded-full
                border
                border-white/10
                bg-black/20
                text-white/80
                backdrop-blur-xl
                transition
                hover:border-secondary/40
                hover:text-secondary
                sm:h-11
                sm:w-11
              "
              aria-label={t(
                "cart.title",
              )}
            >
              <ShoppingBag
                size={
                  18
                }
              />

              {count > 0 && (
                <span
                  className="
                    absolute
                    -right-0.5
                    -top-0.5
                    grid
                    h-5
                    min-w-5
                    place-items-center
                    rounded-full
                    bg-primary
                    px-1
                    font-subtitle
                    text-[10px]
                    text-ink
                  "
                >
                  {
                    count
                  }
                </span>
              )}
            </button>

            {/* =============================================
                MOBILE MENU BUTTON
            ============================================== */}

            <button
              type="button"
              onClick={() =>
                setMenuOpen(
                  true,
                )
              }
              className="
                relative
                z-20
                grid
                h-10
                w-10
                shrink-0
                place-items-center
                rounded-full
                border
                border-white/10
                bg-black/30
                text-white
                backdrop-blur-xl
                transition
                hover:border-white/25
                hover:bg-white/[0.08]
                focus:outline-none
                focus:ring-0
                sm:h-11
                sm:w-11
                lg:hidden
              "
              aria-label={t(
                "nav.menu",
              )}
              aria-expanded={
                menuOpen
              }
              aria-haspopup="dialog"
            >
              <Menu
                size={20}
              />
            </button>
          </div>
        </div>
      </header>

      {/* ===================================================
          MOBILE MENU PORTAL
      ==================================================== */}

      {mobileMenu}
    </>
  );
}