import type { PromoterContact } from "../types";

function digits(value: string | null | undefined) {
  return value?.replace(/\D/g, "") || null;
}

/**
 * Démonstration uniquement.
 *
 * En production, le contact du promoteur doit être renvoyé par le backend
 * après validation du paiement et lecture d’une commande sécurisée. Le front
 * ne doit jamais pouvoir récupérer un numéro privé à partir d’un simple ref.
 */
export async function resolvePromoterContact(
  reference: string | null
): Promise<PromoterContact | null> {
  if (!reference) return null;

  const number = digits(
    import.meta.env.VITE_DEFAULT_PROMOTER_WHATSAPP_NUMBER
  );

  if (!number) return null;

  return {
    reference,
    displayName: "Votre promoteur B4F",
    firstname: null,
    phone: number,
    whatsappNumber: number,
    instagram: null
  };
}

export function promoterWhatsAppUrl({
  contact,
  orderReference,
  eventNames
}: {
  contact: PromoterContact;
  orderReference: string;
  eventNames: string[];
}) {
  const number = digits(
    contact.whatsappNumber || contact.phone
  );

  if (!number) return null;

  const message = [
    `Bonjour ${contact.firstname || ""}`.trim() + " 👋",
    "J’ai réservé avec votre lien B4F.",
    `Commande : ${orderReference}`,
    `Événement(s) : ${eventNames.join(", ")}`,
    "",
    "J’ai une question concernant ma réservation :"
  ].join("\n");

  return `https://wa.me/${number}?text=${encodeURIComponent(
    message
  )}`;
}
