import {
  asHttpResponse,
  assertPost,
  handleOptions,
  jsonResponse,
} from "../_shared/http.ts";
import { sendSaleNotification } from "../_shared/notifications.ts";
import { admin } from "../_shared/supabase.ts";
import { getCheckout } from "../_shared/sumup.ts";

function checkoutIdFromPayload(body: any) {
  return String(
    body?.id ?? body?.checkout_id ?? body?.checkoutId ?? body?.resource?.id ?? "",
  ).trim();
}

async function synchronizeCheckout(checkoutId: string) {
  const checkout = await getCheckout(checkoutId);
  const status = String(checkout?.status ?? "PENDING").toUpperCase();
  const paidAmount = Number(checkout?.amount ?? 0);

  await admin
    .from("SumupTicketCheckoutDraft")
    .update({
      status: ["PAID", "FAILED", "EXPIRED", "CANCELLED"].includes(status)
        ? status
        : "PROCESSING",
      raw_checkout: checkout,
      provider_paid_amount: status === "PAID" ? paidAmount : 0,
      paid_at: status === "PAID" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("checkout_id", checkoutId)
    .eq("sale_created", false);

  if (status !== "PAID") {
    if (["FAILED", "EXPIRED", "CANCELLED"].includes(status)) {
      const { data: draft } = await admin
        .from("SumupTicketCheckoutDraft")
        .select("cart_id,payload")
        .eq("checkout_id", checkoutId)
        .maybeSingle();

      if (draft?.cart_id) {
        await admin.rpc("public_cancel_checkout_reservations", {
          p_cart_id: draft.cart_id,
        });
      }

      const orderId = draft?.payload?.order?.order_id;
      if (orderId) {
        await admin
          .from("public_orders")
          .update({ status: status === "EXPIRED" ? "expired" : "failed" })
          .eq("id", orderId)
          .eq("status", "pending");
      }
    }

    return { ok: true, status, finalized: false };
  }

  const { data: saleResult, error } = await admin.rpc(
    "public_finalize_sumup_checkout",
    {
      p_checkout_id: checkoutId,
      p_provider_checkout: checkout,
    },
  );

  if (error) throw error;

  if (saleResult?.ok === false) {
    throw new Error(saleResult.message || "Création de la vente impossible.");
  }

  try {
    await sendSaleNotification({
      orderId: saleResult.order_id,
      sellerName: saleResult.promoter_name || "B4F Events",
      lines: saleResult.notification_lines ?? [],
    });
  } catch (notificationError) {
    console.error("Vente créée, notification non envoyée", notificationError);
  }

  return { ok: true, status, finalized: true, saleResult };
}

Deno.serve(async (req) => {
  const options = handleOptions(req);
  if (options) return options;

  try {
    assertPost(req);
    const body = await req.json().catch(() => ({}));
    const checkoutId = checkoutIdFromPayload(body);

    if (!checkoutId) {
      // SumUp peut effectuer un test sans identifiant exploitable : répondre vite en 2xx.
      return jsonResponse({ ok: true, ignored: true });
    }

    return jsonResponse(await synchronizeCheckout(checkoutId));
  } catch (error) {
    // Le webhook doit renvoyer 2xx après journalisation pour éviter les boucles.
    console.error("public-sumup-webhook", error);
    const response = asHttpResponse(error);
    const body = await response.text();
    return new Response(body, {
      status: 200,
      headers: response.headers,
    });
  }
});

export { synchronizeCheckout };
