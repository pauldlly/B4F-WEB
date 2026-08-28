import {
  ArrowRight,
  CircleHelp,
  Menu,
  ShoppingBag,
  Sparkles,
  Ticket,
  UserRound,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

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

const transparentRoutes =
  new Set([
    "/",
    "/events",
    "/packs",
    "/barcelona",
    "/rejoindre",
    "/aide",
  ]);

export function Header() {
  const location =
    useLocation();

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const [
    scrolled,
    setScrolled,
  ] = useState(false);

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

  useBodyScrollLock(
    menuOpen,
  );

  useEffect(() => {
    const onScroll = () => {
      setScrolled(
        window.scrollY >
          24,
      );
    };

    onScroll();

    window.addEventListener(
      "scroll",
      onScroll,
      {
        passive: true,
      },
    );

    return () => {
      window.removeEventListener(
        "scroll",
        onScroll,
      );
    };
  }, []);

  useEffect(() => {
    setMenuOpen(
      false,
    );
  }, [
    location.pathname,
  ]);

  const transparent =
    transparentRoutes.has(
      location.pathname,
    ) &&
    !scrolled;

  const desktopLinks =
    useMemo(
      () => [
        {
          to: "/events",

          label:
            t(
              "nav.events",
            ),
        },

        {
          to: "/packs",

          label:
            t(
              "nav.packs",
            ),
        },

        {
          to: "/rejoindre",

          label:
            "Jobs",
        },
      ],
      [
        t,
      ],
    );

  /*
   * MOBILE :
   * uniquement
   * Events / Packs / Jobs
   */
  const mobileMain =
    desktopLinks;

  const mobileSecondary =
    [
      {
        to: "/mes-billets",

        label:
          t(
            "nav.tickets",
          ),

        icon:
          Ticket,
      },

      {
        to: "/aide",

        label:
          "Aide",

        icon:
          CircleHelp,
      },
    ];

  return (
    <header
      className={`
        fixed
        inset-x-0
        top-0
        z-50
        transition-all
        duration-500

        ${
          transparent
            ? "border-b border-transparent bg-gradient-to-b from-black/80 via-black/30 to-transparent"
            : "border-b border-white/[0.07] bg-[#090909]/[0.92] shadow-[0_16px_55px_rgba(0,0,0,.35)] backdrop-blur-2xl"
        }
      `}
    >
      {/* =====================================================
          HEADER BAR
      ====================================================== */}

      <div
        className="
          page-shell
          flex
          h-[64px]
          items-center
          justify-between
          gap-3
          sm:h-[72px]
        "
      >
        {/* =================================================
            LOGO
        ================================================= */}

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
              w-[72px]
              object-contain
              object-left
              sm:h-[50px]
              sm:w-[82px]
            "
          />
        </Link>

        {/* =================================================
            DESKTOP NAV
        ================================================= */}

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

        {/* =================================================
            RIGHT
        ================================================= */}

        <div
          className="
            relative
            z-10
            flex
            items-center
            gap-1.5
            sm:gap-2
          "
        >
          {/* =============================================
              PARTY MATCH DESKTOP
          ============================================== */}

          <Link
            to="/#party-match"
            className="
              hidden
              h-11
              items-center
              gap-2
              rounded-full
              bg-secondary
              px-5
              font-subtitle
              text-[10px]
              uppercase
              tracking-[0.1em]
              text-ink
              transition
              hover:-translate-y-0.5
              hover:brightness-105
              xl:flex
            "
          >
            <Sparkles
              size={16}
            />

            Trouver ma soirée
          </Link>

          {/* =============================================
              LANGUAGE
          ============================================== */}

          <LanguageSwitcher />

          {/* =============================================
              TICKETS DESKTOP
          ============================================== */}

          <Link
            to="/mes-billets"
            className="
              hidden
              h-11
              w-11
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
            aria-label={
              t(
                "nav.tickets",
              )
            }
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
              aria-label={
                t(
                  "nav.account",
                )
              }
            >
              <UserRound
                size={18}
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
              aria-label={
                t(
                  "nav.login",
                )
              }
            >
              <UserRound
                size={18}
              />
            </button>
          )}

          {/* =============================================
              CART
          ============================================== */}

          <button
            type="button"
            onClick={() =>
              setOpen(
                true,
              )
            }
            className="
              relative
              grid
              h-10
              w-10
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
            aria-label={
              t(
                "cart.title",
              )
            }
          >
            <ShoppingBag
              size={18}
            />

            {count >
              0 && (
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
              grid
              h-10
              w-10
              place-items-center
              rounded-full
              border
              border-white/10
              bg-black/20
              text-white
              backdrop-blur-xl
              transition
              hover:border-white/25
              hover:bg-white/[0.08]
              sm:h-11
              sm:w-11
              lg:hidden
            "
            aria-label={
              t(
                "nav.menu",
              )
            }
          >
            <Menu
              size={20}
            />
          </button>
        </div>
      </div>

      {/* =====================================================
          MOBILE MENU
      ====================================================== */}

      {menuOpen && (
        <div
          className="
            fixed
            inset-0
            z-[90]
            overflow-hidden
            bg-[#080808]
            lg:hidden
          "
        >
          {/* =================================================
              BACKGROUND
          ================================================= */}

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

            {/* B4F GHOST MARK */}
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

          {/* =================================================
              MOBILE CONTENT
          ================================================= */}

          <div
            className="
              custom-scrollbar
              page-shell
              relative
              flex
              h-dvh
              flex-col
              overflow-y-auto
              pb-4
              pt-3
              sm:pb-5
              sm:pt-4
            "
          >
            {/* =============================================
                MOBILE HEADER
            ============================================== */}

            <div
              className="
                flex
                shrink-0
                items-center
                justify-between
              "
            >
              <Link
                to="/"
                onClick={() =>
                  setMenuOpen(
                    false,
                  )
                }
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
                  place-items-center
                  rounded-full
                  border
                  border-white/[0.09]
                  bg-white/[0.035]
                  text-white/60
                  outline-none
                  ring-0
                  transition
                  hover:border-white/20
                  hover:bg-white/[0.07]
                  hover:text-white
                  focus:outline-none
                  focus:ring-0
                "
                aria-label={
                  t(
                    "common.close",
                  )
                }
              >
                <X
                  size={20}
                />
              </button>
            </div>

            {/* =============================================
                INTRO
            ============================================== */}

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

            {/* =============================================
                MAIN NAVIGATION
            ============================================== */}

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
                                : "border-white/[0.07] bg-white/[0.025] text-white/22 group-hover:border-white/15 group-hover:text-white/70"
                            }
                          `}
                        >
                          <ArrowRight
                            size={15}
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

            {/* =============================================
                BOTTOM
            ============================================== */}

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
                {/* =========================================
                    SECONDARY LINKS
                ========================================== */}

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
                              size={14}
                            />
                          </span>

                          <span>
                            {
                              item.label
                            }
                          </span>
                        </Link>
                      );
                    },
                  )}
                </div>

                {/* =========================================
                    ACCOUNT
                ========================================== */}

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
                          size={17}
                        />

                        {t(
                          "nav.account",
                        )}
                      </span>

                      <ArrowRight
                        size={16}
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
                          size={17}
                        />

                        {t(
                          "nav.login",
                        )}
                      </span>

                      <ArrowRight
                        size={16}
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
        </div>
      )}
    </header>
  );
}