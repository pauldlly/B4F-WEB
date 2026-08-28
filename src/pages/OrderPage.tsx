import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Copy,
  Instagram,
  LoaderCircle,
  MapPin,
  MessageCircle,
  Share2,
  Sparkles,
  Table2,
  Ticket,
  UserRound,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Seo } from "../components/Seo";
import { TicketPdfButton } from "../components/TicketPdfButton";
import { useI18n } from "../i18n/LanguageProvider";
import { formatEventDate, formatMoney } from "../lib/format";
import { useOrders } from "../providers/OrdersProvider";
import { getGuestOrderAccess } from "../services/orderAccess";
import { getPublicOrder } from "../services/orders";
import { promoterWhatsAppUrl } from "../services/promoter";

export function OrderPage() {
  const { orderId = "" } = useParams();
  const [params] = useSearchParams();
  const tokenFromUrl = params.get("token");
  const isNew = params.get("new") === "1";
  const { findOrder } = useOrders();
  const { t, locale } = useI18n();
  const storedAccess = getGuestOrderAccess(orderId);
  const accessToken = tokenFromUrl || storedAccess?.accessToken || null;
  const demoMode = import.meta.env.VITE_DEMO_MODE === "true";
  const demoOrder = findOrder(orderId, accessToken);

  const orderQuery = useQuery({
    queryKey: ["public-order", orderId, accessToken],
    queryFn: () => getPublicOrder(orderId, accessToken),
    enabled: Boolean(orderId) && !demoMode,
    staleTime: 15_000,
    refetchOnMount: true,
  });

  const order = demoMode ? demoOrder : orderQuery.data ?? demoOrder;

  if (orderQuery.isPending && !demoMode && !demoOrder) {
    return (
      <div className="page-shell grid min-h-[75vh] place-items-center pb-20 pt-36">
        <div className="text-center">
          <LoaderCircle className="mx-auto animate-spin text-secondary" size={38} />
          <h1 className="mt-6 font-title text-2xl uppercase">
            Chargement sécurisé des billets
          </h1>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-shell pb-24 pt-40 text-center">
        <Seo title="Commande introuvable" description="Commande introuvable." noIndex />
        <h1 className="font-title text-3xl uppercase">Commande introuvable</h1>
        <p className="mt-3 font-body text-white/40">
          {orderQuery.error instanceof Error
            ? orderQuery.error.message
            : "Le lien sécurisé est incorrect ou la commande n’est pas encore payée."}
        </p>
        <Link to="/mes-billets" className="secondary-button mt-6">
          Mes billets
        </Link>
      </div>
    );
  }

  const secureUrl = `${window.location.origin}/commande/${order.id}${
    accessToken ? `?token=${encodeURIComponent(accessToken)}` : ""
  }`;

  const copyLink = async () => navigator.clipboard.writeText(secureUrl);
  const share = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `${order.reference} · B4F EVENTS`,
        text: "Voici mon lien sécurisé B4F EVENTS.",
        url: secureUrl,
      });
      return;
    }
    await copyLink();
  };

  const uniqueEventNames = Array.from(
    new Set(order.tickets.map((ticket) => ticket.eventName)),
  );
  const promoterUrl = order.promoterContact
    ? promoterWhatsAppUrl({
        contact: order.promoterContact,
        orderReference: order.reference,
        eventNames: uniqueEventNames,
      })
    : null;

  return (
    <div className="page-shell pb-16 pt-32 sm:pb-20 sm:pt-36">
      <Seo
        title={`Vos billets ${order.reference}`}
        description="Billets sécurisés B4F EVENTS."
        noIndex
      />

      <Link
        to="/mes-billets"
        className="inline-flex items-center gap-2 font-subtitle text-sm text-white/45 transition hover:text-white"
      >
        <ArrowLeft size={18} />
        Mes billets
      </Link>

      {isNew && (
        <div className="mt-8 flex gap-4 rounded-[24px] border border-green-500/20 bg-green-500/[0.065] p-5 text-green-100">
          <CheckCircle2 className="shrink-0" size={24} />
          <div>
            <strong className="block font-subtitle">Paiement confirmé</strong>
            <p className="mt-1 font-body text-sm text-green-100/70">
              Vos billets ont été créés uniquement après la confirmation SumUp.
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <span className="eyebrow">{order.reference}</span>
          <h1 className="mt-3 font-title text-4xl uppercase leading-[0.9] tracking-[-0.04em] sm:text-6xl">
            Vos billets
          </h1>
          <p className="mt-3 font-body text-white/40">
            Présentez le QR code correspondant à chaque événement.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <TicketPdfButton order={order} />
          <button type="button" onClick={() => void copyLink()} className="secondary-button">
            <Copy size={18} /> Copier le lien
          </button>
          <button type="button" onClick={() => void share()} className="primary-button">
            <Share2 size={18} /> Partager
          </button>
        </div>
      </div>

      {order.promoterReference && (
        <section className="mt-8 overflow-hidden rounded-[26px] border border-[#25D366]/25 bg-[#25D366]/[0.075]">
          <div className="grid gap-5 p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-6">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-black shadow-[0_14px_40px_rgba(37,211,102,.22)]">
              <UserRound size={24} />
            </span>
            <div>
              <span className="font-subtitle text-[10px] uppercase tracking-[0.16em] text-green-300">
                Réservation liée à un promoteur
              </span>
              <h2 className="mt-2 font-title text-2xl uppercase">
                {order.promoterContact?.displayName || "Votre promoteur B4F"}
              </h2>
              <p className="mt-2 max-w-2xl font-body text-sm leading-6 text-white/45">
                Contactez-le pour le point de rendez-vous, l’horaire, le dress code
                ou une question sur votre soirée.
              </p>
              {order.promoterContact?.instagram && (
                <span className="mt-3 inline-flex items-center gap-2 font-body text-xs text-white/45">
                  <Instagram size={15} /> {order.promoterContact.instagram}
                </span>
              )}
            </div>
            {promoterUrl ? (
              <a
                href={promoterUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 font-subtitle text-xs uppercase tracking-[0.08em] text-black transition hover:-translate-y-0.5"
              >
                <MessageCircle size={18} /> Contacter mon promoteur
              </a>
            ) : (
              <Link to="/aide" className="secondary-button">Ouvrir l’aide</Link>
            )}
          </div>
        </section>
      )}

      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
        <section className="grid gap-6 md:grid-cols-2">
          {order.tickets.map((ticket, index) => (
            <article
              key={ticket.id}
              className="ticket-card overflow-hidden rounded-[32px] border border-white/10 bg-[#151515]"
            >
              <div className="relative overflow-hidden bg-gradient-to-br from-orange-950 via-background to-ink p-6">
                <div className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
                <div className="relative flex justify-between font-subtitle text-[10px] uppercase tracking-[0.16em] text-white/35">
                  <span>B4F EVENTS</span>
                  <span>{index + 1}/{order.tickets.length}</span>
                </div>
                <span className="relative mt-6 inline-flex rounded-full bg-white/10 px-3 py-2 font-subtitle text-[10px] uppercase tracking-[0.13em] text-white/60">
                  {ticket.source === "pack" ? "Billet de pack" : "Billet événement"}
                </span>
                <h2 className="relative mt-4 font-title text-2xl uppercase">
                  {ticket.eventName}
                </h2>
                <div className="relative mt-5 space-y-3 font-body text-sm text-white/45">
                  <p className="flex items-center gap-2">
                    <CalendarDays size={17} />
                    {formatEventDate(ticket.eventDate, ticket.startTime, {
                      locale,
                      includeYear: false,
                    })}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin size={17} /> {ticket.location || "Lieu à venir"}
                  </p>
                </div>
              </div>

              <div className="p-6">
                <div className="qr-paper mx-auto grid w-fit place-items-center rounded-3xl p-4">
                  <QRCodeSVG
                    value={ticket.qrCode}
                    size={190}
                    level="M"
                    bgColor="#ffffff"
                    fgColor="#111111"
                  />
                </div>

                {(ticket.optionNames?.length > 0 || ticket.tableNames?.length > 0) && (
                  <div className="mt-5 space-y-2 rounded-2xl bg-white/[0.04] p-4 font-body text-xs text-white/50">
                    {ticket.optionNames?.map((name) => (
                      <p key={`option-${name}`} className="flex items-center gap-2">
                        <Sparkles size={14} className="text-secondary" /> {name}
                      </p>
                    ))}
                    {ticket.tableNames?.map((name) => (
                      <p key={`table-${name}`} className="flex items-center gap-2">
                        <Table2 size={14} className="text-primary" /> {name}
                      </p>
                    ))}
                  </div>
                )}

                <div className="mt-5 text-center">
                  <strong className="block font-subtitle">{ticket.holderName}</strong>
                  <span className="mt-1 block font-subtitle text-xs uppercase tracking-[0.14em] text-secondary">
                    {ticket.gender === "woman" ? "Femme" : "Homme"}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </section>

        <aside className="surface-card h-fit p-5 sm:p-6 lg:sticky lg:top-28">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-secondary/10 text-secondary">
              <Ticket size={21} />
            </span>
            <div>
              <h2 className="font-title text-lg uppercase">Commande</h2>
              <p className="font-body text-xs text-white/35">{order.reference}</p>
            </div>
          </div>
          <div className="mt-6 space-y-3 font-body text-sm">
            <div className="flex justify-between gap-4 text-white/45">
              <span>Client</span>
              <strong className="text-right font-subtitle text-white">
                {order.customer.name}
              </strong>
            </div>
            <div className="flex justify-between text-white/45">
              <span>Billets</span>
              <strong className="font-subtitle text-white">{order.tickets.length}</strong>
            </div>
            <div className="flex justify-between text-white/45">
              <span>Statut</span>
              <strong className="font-subtitle text-green-400">Payé</strong>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-4 text-lg">
              <span className="font-subtitle">Total</span>
              <strong className="font-title">{formatMoney(order.total, locale)}</strong>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
