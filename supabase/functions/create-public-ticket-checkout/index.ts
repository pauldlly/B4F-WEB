import { normalizeCheckoutPayload } from "../_shared/checkout.ts";
import {
  asHttpResponse,
  assertPost,
  handleOptions,
  jsonResponse,
  HttpError,
} from "../_shared/http.ts";
import { randomToken, sha256, cleanText } from "../_shared/security.ts";
import { admin, getOptionalUser } from "../_shared/supabase.ts";
import { createHostedCheckout } from "../_shared/sumup.ts";

Deno.serve(async (req) => {
  const options = handleOptions(req);
  if (options) return options;

  let orderId: string | null = null;
  let cartId: string | null = null;

  try {
    assertPost(req);
    const body = await req.json();
    const normalized = await normalizeCheckoutPayload(body);
    const user = await getOptionalUser(req);

    orderId = crypto.randomUUID();
    cartId = `web-${orderId}`;
    const accessToken = randomToken(32);
    const accessTokenHash = await sha256(accessToken);
    const now = new Date();
    const reference = `B4F-WEB-${now
      .toISOString()
      .slice(0, 10)
      .replaceAll("-", "")}-${orderId.slice(0, 8).toUpperCase()}`;
    const checkoutReference = `WEB-${orderId}`.slice(0, 90);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    const affiliate = body?.affiliate ?? {};
    const promoterReference = cleanText(
      affiliate?.promoterReference ?? body?.promoterReference,
      120,
    ) || null;
    const scopeType = ["general", "event", "pack"].includes(affiliate?.scopeType)
      ? affiliate.scopeType
      : null;
    const scopeId = cleanText(affiliate?.scopeId, 100) || null;

    if (scopeType === "event" && scopeId) {
      const expectedEventId = Number(scopeId);
      const onlyTargetEvent =
        Number.isFinite(expectedEventId) &&
        normalized.groups.length > 0 &&
        normalized.groups.every(
          (group) =>
            group.kind === "event" &&
            group.selected_events.length === 1 &&
            group.selected_events[0]?.event_id === expectedEventId,
        );

      if (!onlyTargetEvent) {
        throw new HttpError(
          400,
          "AFFILIATE_EVENT_SCOPE_MISMATCH",
          "Ce lien promoteur est réservé à cet événement. Retirez les autres articles du panier ou utilisez le lien général du promoteur.",
        );
      }
    }

    if (scopeType === "pack" && scopeId) {
      const onlyTargetPack =
        normalized.groups.length > 0 &&
        normalized.groups.every(
          (group) =>
            group.kind === "pack" && String(group.source_id) === scopeId,
        );

      if (!onlyTargetPack) {
        throw new HttpError(
          400,
          "AFFILIATE_PACK_SCOPE_MISMATCH",
          "Ce lien promoteur est réservé à ce pack. Retirez les autres articles du panier ou utilisez le lien général du promoteur.",
        );
      }
    }

    const { error: orderError } = await admin.from("public_orders").insert({
      id: orderId,
      reference,
      access_token_hash: accessTokenHash,
      auth_user_id: user?.id ?? null,
      promoter_id: normalized.seller.promoterId,
      promoter_reference: promoterReference,
      affiliate_scope_type: scopeType,
      affiliate_scope_id: scopeId,
      checkout_reference: checkoutReference,
      status: "pending",
      customer_name: normalized.customer.name,
      customer_email: normalized.customer.email,
      customer_phone_code: normalized.customer.phoneCode,
      customer_phone: normalized.customer.phone,
      subtotal: normalized.subtotal,
      service_fee: normalized.serviceFee,
      total: normalized.total,
    });

    if (orderError) throw orderError;

    const { data: reservationResult, error: reservationError } = await admin.rpc(
      "public_reserve_ticket_checkout",
      {
        p_cart_id: cartId,
        p_promoter_id: normalized.seller.promoterId,
        p_groups: normalized.groups,
        p_expires_at: expiresAt,
      },
    );

    if (reservationError) throw reservationError;
    if (reservationResult?.ok === false) {
      throw new Error(reservationResult.message || "Réservation impossible.");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const publicSiteUrl = (Deno.env.get("PUBLIC_SITE_URL") || "https://b4fevents.com")
      .replace(/\/+$/, "");
    const webhookUrl = `${supabaseUrl}/functions/v1/public-sumup-webhook`;
    const redirectUrl = `${publicSiteUrl}/paiement/retour?orderId=${encodeURIComponent(orderId)}`;

    const checkout = await createHostedCheckout({
      reference: checkoutReference,
      amount: normalized.total,
      description: `B4F · ${normalized.notificationLines
        .map((line) => `${line.quantity}x ${line.name}`)
        .join(" · ")}`.slice(0, 200),
      returnUrl: webhookUrl,
      redirectUrl,
    });

    if (!checkout?.id || !checkout?.hosted_checkout_url) {
      throw new Error("SumUp n’a pas retourné de page de paiement.");
    }

    const payload = {
      version: 1,
      order: {
        order_id: orderId,
        reference,
        auth_user_id: user?.id ?? null,
        promoter_id: normalized.seller.promoterId,
        manager_id: normalized.seller.managerId,
        seller_is_manager: normalized.seller.sellerIsManager,
        seller_name: normalized.seller.sellerName,
        promoter_reference: promoterReference,
        affiliate_scope_type: scopeType,
        affiliate_scope_id: scopeId,
        customer_name: normalized.customer.name,
        customer_email: normalized.customer.email,
        customer_phone_code: normalized.customer.phoneCode,
        customer_phone: normalized.customer.phone,
        subtotal: normalized.subtotal,
        transaction_fee: normalized.transactionFee,
        application_fee: normalized.applicationFee,
        service_fee: normalized.serviceFee,
        total: normalized.total,
        ticket_count: normalized.ticketCount,
      },
      groups: normalized.groups,
      notification_lines: normalized.notificationLines,
    };

    const { error: draftError } = await admin
      .from("SumupTicketCheckoutDraft")
      .insert({
        checkout_id: checkout.id,
        checkout_reference: checkoutReference,
        hosted_checkout_url: checkout.hosted_checkout_url,
        cart_id: cartId,
        promoter_id: normalized.seller.promoterId,
        status: String(checkout.status || "PENDING").toUpperCase(),
        currency: "EUR",
        total_amount: normalized.subtotal,
        cash_amount: 0,
        card_amount: normalized.subtotal,
        tip_amount: 0,
        transaction_fee_amount: normalized.transactionFee,
        charged_amount: normalized.total,
        payload,
        raw_checkout: checkout,
        sumup_amount: normalized.total,
      });

    if (draftError) throw draftError;

    const { error: orderUpdateError } = await admin
      .from("public_orders")
      .update({
        checkout_id: checkout.id,
        checkout_reference: checkoutReference,
      })
      .eq("id", orderId);

    if (orderUpdateError) throw orderUpdateError;

    return jsonResponse({
      ok: true,
      checkoutUrl: checkout.hosted_checkout_url,
      checkoutId: checkout.id,
      orderId,
      orderReference: reference,
      accessToken,
      expiresAt,
    });
  } catch (error) {
    if (cartId) {
      await admin.rpc("public_cancel_checkout_reservations", {
        p_cart_id: cartId,
      });
    }

    if (orderId) {
      await admin
        .from("public_orders")
        .update({ status: "failed" })
        .eq("id", orderId)
        .eq("status", "pending");
    }

    return asHttpResponse(error);
  }
});
