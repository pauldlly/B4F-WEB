import { shortReference } from "../lib/format";
import { makeId } from "../lib/id";
import { supabase } from "../lib/supabase";
import type {
  CheckoutPayload,
  Gender,
  GuestOrder,
  GuestTicket,
} from "../types";
import { saveGuestOrderAccess } from "./orderAccess";

function createTicket({
  orderId,
  accessToken,
  source,
  eventId,
  eventName,
  eventDate,
  startTime,
  location,
  holderName,
  gender,
  optionNames,
  tableNames,
}: {
  orderId: string;
  accessToken: string;
  source: "event" | "pack";
  eventId: number;
  eventName: string;
  eventDate: string | null;
  startTime: string | null;
  location: string | null;
  holderName: string;
  gender: Gender;
  optionNames: string[];
  tableNames: string[];
}): GuestTicket {
  const ticketId = makeId();

  return {
    id: ticketId,
    orderId,
    source,
    eventId,
    eventName,
    eventDate,
    startTime,
    location,
    holderName,
    gender,
    optionNames,
    tableNames,
    qrCode: `B4F:${ticketId}:${accessToken}`,
    scanned: false,
  };
}

async function createDemoOrder(payload: CheckoutPayload): Promise<GuestOrder> {
  const orderId = makeId();
  const accessToken = makeId();
  const tickets: GuestTicket[] = [];

  payload.items.forEach((item) => {
    if (item.kind === "event") {
      const optionNames = item.extras
        .filter((extra) => extra.kind === "option")
        .map((extra) => extra.name);
      const tableNames = item.extras
        .filter((extra) => extra.kind === "table")
        .map((extra) => extra.name);

      for (let index = 0; index < item.quantity; index += 1) {
        tickets.push(
          createTicket({
            orderId,
            accessToken,
            source: "event",
            eventId: item.eventId,
            eventName: item.eventName,
            eventDate: item.eventDate,
            startTime: item.startTime,
            location: item.location,
            holderName: payload.customer.name,
            gender: item.gender,
            optionNames,
            tableNames,
          }),
        );
      }
      return;
    }

    item.selectedEvents.forEach((packEvent) => {
      const relatedExtras = item.extras.filter(
        (extra) => extra.eventId === packEvent.eventId,
      );
      const optionNames = relatedExtras
        .filter((extra) => extra.kind === "option")
        .map((extra) => extra.name);
      const tableNames = relatedExtras
        .filter((extra) => extra.kind === "table")
        .map((extra) => extra.name);

      for (let index = 0; index < item.maleQuantity; index += 1) {
        tickets.push(
          createTicket({
            orderId,
            accessToken,
            source: "pack",
            eventId: packEvent.eventId,
            eventName: packEvent.name,
            eventDate: packEvent.eventDate,
            startTime: packEvent.startTime,
            location: packEvent.location,
            holderName: payload.customer.name,
            gender: "man",
            optionNames,
            tableNames,
          }),
        );
      }

      for (let index = 0; index < item.femaleQuantity; index += 1) {
        tickets.push(
          createTicket({
            orderId,
            accessToken,
            source: "pack",
            eventId: packEvent.eventId,
            eventName: packEvent.name,
            eventDate: packEvent.eventDate,
            startTime: packEvent.startTime,
            location: packEvent.location,
            holderName: payload.customer.name,
            gender: "woman",
            optionNames,
            tableNames,
          }),
        );
      }
    });
  });

  const subtotal = Math.round(
    payload.items.reduce((sum, item) => {
      const extras = item.extras.reduce(
        (extraSum, extra) => extraSum + extra.unitPrice * extra.quantity,
        0,
      );

      if (item.kind === "event") {
        return sum + item.unitPrice * item.quantity + extras;
      }

      return (
        sum +
        item.maleUnitPrice * item.maleQuantity +
        item.femaleUnitPrice * item.femaleQuantity +
        extras
      );
    }, 0) * 100,
  ) / 100;
  const ticketCount = payload.items.reduce((sum, item) => {
    if (item.kind === "event") return sum + item.quantity;
    return (
      sum +
      (item.maleQuantity + item.femaleQuantity) *
        Math.max(1, item.selectedEvents.length)
    );
  }, 0);
  const transactionFee = subtotal <= 0 ? 0 : subtotal <= 40 ? 0.99 : Math.round(subtotal * 0.025 * 100) / 100;
  const applicationFee = Math.round(ticketCount * 0.5 * 100) / 100;
  const serviceFee = Math.round((transactionFee + applicationFee) * 100) / 100;
  const total = Math.round((subtotal + serviceFee) * 100) / 100;

  const order: GuestOrder = {
    id: orderId,
    accessToken,
    reference: `B4F-${shortReference(orderId)}`,
    createdAt: new Date().toISOString(),
    paidAt: new Date().toISOString(),
    customer: payload.customer,
    userId: null,
    promoterReference: payload.affiliate.promoterReference,
    promoterContact: null,
    status: "paid",
    subtotal,
    serviceFee,
    total,
    tickets,
    benefits: [
      {
        id: "demo-jetski",
        category: "jetski",
        partnerName: "Partenaire Jet Ski Barcelona",
        title: "Réduction Jet Ski",
        description: "Avantage réservé aux clients B4F.",
        discountLabel: "-15 %",
        redemptionInstructions: "Présentez ce billet B4F au partenaire.",
        imageUrl: null,
        websiteUrl: null,
        address: null,
        validFrom: null,
        validUntil: null,
      },
      {
        id: "demo-coffee",
        category: "coffee_shop",
        partnerName: "Coffee Shop partenaire B4F",
        title: "Réduction Coffee Shop",
        description: "Avantage réservé aux clients B4F.",
        discountLabel: "-10 %",
        redemptionInstructions: "Présentez ce billet B4F au partenaire.",
        imageUrl: null,
        websiteUrl: null,
        address: null,
        validFrom: null,
        validUntil: null,
      },
    ],
  };

  saveGuestOrderAccess({
    orderId,
    accessToken,
    orderReference: order.reference,
    createdAt: order.createdAt,
  });

  return order;
}

export async function createGuestCheckout(payload: CheckoutPayload): Promise<
  | { mode: "demo"; order: GuestOrder }
  | {
      mode: "redirect";
      checkoutUrl: string;
      checkoutId: string;
      orderId: string;
      orderReference: string;
      accessToken: string;
      expiresAt: string;
    }
> {
  const demoMode = import.meta.env.VITE_DEMO_MODE === "true";

  if (demoMode) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { mode: "demo", order: await createDemoOrder(payload) };
  }

  if (!supabase) throw new Error("Supabase n’est pas configuré.");

  const { data, error } = await supabase.functions.invoke(
    "create-public-ticket-checkout",
    { body: payload },
  );

  if (error) throw error;
  if (data?.ok === false || !data?.checkoutUrl) {
    throw new Error(data?.message || "Le paiement SumUp n’a pas pu être créé.");
  }

  const result = {
    mode: "redirect" as const,
    checkoutUrl: String(data.checkoutUrl),
    checkoutId: String(data.checkoutId),
    orderId: String(data.orderId),
    orderReference: String(data.orderReference),
    accessToken: String(data.accessToken),
    expiresAt: String(data.expiresAt),
  };

  saveGuestOrderAccess({
    orderId: result.orderId,
    accessToken: result.accessToken,
    orderReference: result.orderReference,
    createdAt: new Date().toISOString(),
  });

  return result;
}
