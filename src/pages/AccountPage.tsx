import { LogOut, Mail, Ticket, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

import { Seo } from "../components/Seo";
import { useI18n } from "../i18n/LanguageProvider";
import { useAuth } from "../providers/AuthProvider";
import { useOrders } from "../providers/OrdersProvider";

export function AccountPage() {
  const { user, loading, openAuth, signOut } = useAuth();
  const { orders } = useOrders();
  const { t } = useI18n();

  if (loading) {
    return (
      <div className="page-shell pb-24 pt-36 text-center font-body text-white/40">
        {t("common.loading")}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-shell pb-24 pt-36 text-center">
        <Seo title={t("account.title")} description={t("account.loginText")} noIndex />
        <UserRound className="mx-auto text-white/20" size={48} />
        <h1 className="mt-5 font-title text-3xl uppercase">
          {t("account.loginRequired")}
        </h1>
        <p className="mt-3 font-body text-white/40">{t("account.loginText")}</p>
        <button
          type="button"
          onClick={() => openAuth("login")}
          className="primary-button mt-6"
        >
          {t("auth.signIn")}
        </button>
      </div>
    );
  }

  const accountOrders = orders.filter(
    (order) => !order.userId || order.userId === user.id,
  );

  return (
    <div className="page-shell pb-20 pt-36 sm:pb-24 sm:pt-40">
      <Seo
        title={t("account.title")}
        description={t("account.eyebrow")}
        path="/compte"
        noIndex
      />

      <span className="eyebrow">{t("account.eyebrow")}</span>
      <h1 className="mt-3 font-title text-4xl uppercase leading-[0.9] sm:text-6xl">
        {t("account.title")}
      </h1>

      <div className="mt-10 grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="surface-card h-fit p-6">
          <span className="grid h-16 w-16 place-items-center rounded-[22px] bg-secondary/10 text-secondary">
            <UserRound size={28} />
          </span>

          <h2 className="mt-5 font-title text-xl uppercase">
            {user.user_metadata?.full_name || "B4F Guest"}
          </h2>
          <p className="mt-3 flex items-center gap-2 font-body text-sm text-white/40">
            <Mail size={16} />
            {user.email}
          </p>

          <button
            type="button"
            onClick={() => void signOut()}
            className="secondary-button mt-6 w-full"
          >
            <LogOut size={18} />
            {t("account.logout")}
          </button>
        </aside>

        <section className="surface-card p-6">
          <div className="flex items-center gap-3">
            <Ticket className="text-secondary" size={24} />
            <h2 className="font-title text-xl uppercase">{t("account.orders")}</h2>
          </div>

          {accountOrders.length === 0 ? (
            <div className="mt-8 rounded-[24px] border border-dashed border-white/10 p-8 text-center">
              <p className="font-body text-white/40">{t("account.noOrders")}</p>
              <Link to="/" className="primary-button mt-5">
                {t("home.browse")}
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {accountOrders.map((order) => (
              <Link
  key={order.id}
  to={
    order.accessToken
      ? `/commande/${order.id}?token=${encodeURIComponent(
          order.accessToken,
        )}`
      : `/commande/${order.id}`
  }
  className="flex items-center justify-between rounded-[20px] border border-white/[0.08] bg-background p-4 transition hover:border-secondary/30"
>
  <div>
    <span className="font-subtitle text-xs text-secondary">
      {order.reference}
    </span>

    <strong className="mt-1 block font-subtitle">
      {order.tickets.length}{" "}
      {order.tickets.length > 1
        ? t("common.tickets")
        : t("common.ticket")}
    </strong>
  </div>

  <span className="font-subtitle">
    {t("common.open")}
  </span>
</Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
