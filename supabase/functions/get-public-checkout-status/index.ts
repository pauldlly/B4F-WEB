import {
  asHttpResponse,
  assertPost,
  handleOptions,
  jsonResponse,
} from "../_shared/http.ts";
import { activeBenefits, getAuthorizedOrder, publicOrderSnapshot } from "../_shared/orders.ts";
import { sendSaleNotification } from "../_shared/notifications.ts";
import { admin } from "../_shared/supabase.ts";
import { getCheckout } from "../_shared/sumup.ts";

Deno.serve(async (req) => {
  const options = handleOptions(req);
  if (options) return options;

  try {
    assertPost(req);
    const body = await req.json();
    let order = await getAuthorizedOrder(req, body, { allowPending: true });

    if (order.status === "pending" && order.checkout_id) {
      const checkout = await getCheckout(order.checkout_id);
      const status = String(checkout?.status ?? "PENDING").toUpperCase();

      if (status === "PAID") {
        const { data: saleResult, error } = await admin.rpc(
          "public_finalize_sumup_checkout",
          {
            p_checkout_id: order.checkout_id,
            p_provider_checkout: checkout,
          },
        );

        if (error) throw error;
        if (saleResult?.ok === false) {
          throw new Error(saleResult.message || "Création des billets impossible.");
        }

        try {
          await sendSaleNotification({
            orderId: saleResult.order_id,
            sellerName: saleResult.promoter_name || "B4F Events",
            lines: saleResult.notification_lines ?? [],
          });
        } catch (notificationError) {
          console.error("Notification non envoyée", notificationError);
        }
      } else if (["FAILED", "EXPIRED", "CANCELLED"].includes(status)) {
        await admin
          .from("public_orders")
          .update({ status: status === "EXPIRED" ? "expired" : "failed" })
          .eq("id", order.id)
          .eq("status", "pending");
      }

      order = await getAuthorizedOrder(req, body, { allowPending: true });
    }

    if (order.status === "paid") {
      return jsonResponse({
        ok: true,
        status: "paid",
        order: publicOrderSnapshot(order, await activeBenefits()),
      });
    }

    return jsonResponse({
      ok: true,
      status: order.status,
      orderId: order.id,
      reference: order.reference,
    });
  } catch (error) {
    return asHttpResponse(error);
  }
});
