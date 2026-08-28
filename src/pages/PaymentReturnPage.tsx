import {
  CheckCircle2,
  CircleAlert,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { Seo } from "../components/Seo";
import { useCart } from "../providers/CartProvider";
import { getGuestOrderAccess } from "../services/orderAccess";
import { getCheckoutStatus } from "../services/orders";
import type { GuestOrder } from "../types";

export function PaymentReturnPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { clear } = useCart();
  const orderId = params.get("orderId") || "";
  const access = getGuestOrderAccess(orderId);
  const [status, setStatus] = useState<GuestOrder["status"] | "checking">(
    "checking",
  );
  const [message, setMessage] = useState(
    "Nous vérifions le paiement SumUp et préparons vos QR codes.",
  );
  const attempts = useRef(0);

  useEffect(() => {
    if (!orderId) {
      setStatus("failed");
      setMessage("Identifiant de commande manquant.");
      return;
    }

    let cancelled = false;
    let timer: number | null = null;

    const check = async () => {
      try {
        attempts.current += 1;
        const result = await getCheckoutStatus(orderId, access?.accessToken);
        if (cancelled) return;

        setStatus(result.status);

        if (result.status === "paid") {
          clear();
          navigate(
            `/commande/${orderId}?token=${encodeURIComponent(
              access?.accessToken || "",
            )}&new=1`,
            { replace: true },
          );
          return;
        }

        if (["failed", "expired", "cancelled"].includes(result.status)) {
          setMessage(
            result.status === "expired"
              ? "La session de paiement a expiré. Votre panier n’a pas été encaissé."
              : "Le paiement n’a pas été validé. Aucun billet n’a été créé.",
          );
          return;
        }

        if (attempts.current < 25) {
          timer = window.setTimeout(check, 2200);
        } else {
          setMessage(
            "La confirmation prend plus de temps que prévu. Vous pouvez relancer la vérification.",
          );
        }
      } catch (error) {
        if (cancelled) return;
        setMessage(
          error instanceof Error
            ? error.message
            : "Vérification du paiement impossible.",
        );
        if (attempts.current < 8) {
          timer = window.setTimeout(check, 3000);
        }
      }
    };

    void check();

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [access?.accessToken, clear, navigate, orderId]);

  const terminal = ["failed", "expired", "cancelled"].includes(status);

  return (
    <div className="page-shell grid min-h-[78vh] place-items-center pb-20 pt-36">
      <Seo
        title="Confirmation du paiement"
        description="Confirmation sécurisée de votre paiement B4F EVENTS."
        noIndex
      />

      <section className="surface-card relative w-full max-w-2xl overflow-hidden p-7 text-center sm:p-12">
        <div className="absolute -right-28 -top-28 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-28 -left-28 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />

        <span
          className={`relative mx-auto grid h-20 w-20 place-items-center rounded-full border ${
            terminal
              ? "border-red-500/25 bg-red-500/10 text-red-300"
              : status === "paid"
                ? "border-green-500/25 bg-green-500/10 text-green-300"
                : "border-secondary/25 bg-secondary/10 text-secondary"
          }`}
        >
          {terminal ? (
            <CircleAlert size={34} />
          ) : status === "paid" ? (
            <CheckCircle2 size={34} />
          ) : (
            <LoaderCircle className="animate-spin" size={34} />
          )}
        </span>

        <span className="eyebrow relative mt-7 block">Paiement SumUp</span>
        <h1 className="relative mt-3 font-title text-3xl uppercase leading-[0.9] sm:text-5xl">
          {terminal ? "Paiement non confirmé" : "Création de vos billets"}
        </h1>
        <p className="relative mx-auto mt-5 max-w-xl font-body leading-7 text-white/45">
          {message}
        </p>

        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          {!terminal && (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="secondary-button"
            >
              <RefreshCw size={18} />
              Vérifier maintenant
            </button>
          )}

          {terminal && (
            <Link to="/checkout" className="primary-button">
              Revenir au panier
            </Link>
          )}

          <Link to="/aide" className="secondary-button">
            Contacter l’aide B4F
          </Link>
        </div>
      </section>
    </div>
  );
}
