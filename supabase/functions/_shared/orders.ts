import { HttpError } from "./http.ts";
import { cleanText, sha256 } from "./security.ts";
import { admin, getOptionalUser } from "./supabase.ts";

export type PublicOrderRow = {
  id: string;
  reference: string;
  access_token_hash: string;
  auth_user_id: string | null;
  status: string;
  checkout_id: string | null;
  checkout_reference: string | null;
  snapshot: Record<string, unknown> | null;
  created_at: string;
  paid_at: string | null;
};

export async function getAuthorizedOrder(
  req: Request,
  body: any,
  options: { allowPending?: boolean } = {},
): Promise<PublicOrderRow> {
  const orderId = cleanText(body?.orderId, 80, true);
  const accessToken = cleanText(body?.accessToken, 256);
  const user = await getOptionalUser(req);

  const { data, error } = await admin
    .from("public_orders")
    .select(
      "id,reference,access_token_hash,auth_user_id,status,checkout_id,checkout_reference,snapshot,created_at,paid_at",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new HttpError(404, "ORDER_NOT_FOUND", "Commande introuvable.");
  }

  const authenticatedOwner = Boolean(user?.id && data.auth_user_id === user.id);
  const guestOwner = Boolean(
    accessToken && (await sha256(accessToken)) === data.access_token_hash,
  );

  if (!authenticatedOwner && !guestOwner) {
    throw new HttpError(403, "ORDER_ACCESS_DENIED", "Accès à la commande refusé.");
  }

  if (!options.allowPending && data.status !== "paid") {
    throw new HttpError(409, "ORDER_NOT_PAID", "La commande n’est pas encore payée.");
  }

  return data as PublicOrderRow;
}

export async function activeBenefits() {
  const now = Date.now();
  const { data, error } = await admin
    .from("partner_benefits")
    .select(
      "id,category,partner_name,title,description,discount_label,redemption_instructions,image_url,website_url,address,valid_from,valid_until,display_order",
    )
    .eq("active", true)
    .order("display_order", { ascending: true });

  if (error) throw error;

  return (data ?? [])
    .filter((row) => {
      const starts = row.valid_from ? new Date(row.valid_from).getTime() : null;
      const ends = row.valid_until ? new Date(row.valid_until).getTime() : null;
      return (starts === null || starts <= now) && (ends === null || ends >= now);
    })
    .map((row) => ({
    id: row.id,
    category: row.category,
    partnerName: row.partner_name,
    title: row.title,
    description: row.description,
    discountLabel: row.discount_label,
    redemptionInstructions: row.redemption_instructions,
    imageUrl: row.image_url,
    websiteUrl: row.website_url,
    address: row.address,
    validFrom: row.valid_from,
    validUntil: row.valid_until,
  }));
}

export function publicOrderSnapshot(order: PublicOrderRow, benefits: unknown[]) {
  const snapshot = (order.snapshot ?? {}) as Record<string, unknown>;

  return {
    ...snapshot,
    id: snapshot.id ?? order.id,
    reference: snapshot.reference ?? order.reference,
    status: order.status,
    createdAt: snapshot.createdAt ?? order.created_at,
    paidAt: order.paid_at,
    benefits,
  };
}
