import {
  asHttpResponse,
  assertPost,
  handleOptions,
  jsonResponse,
} from "../_shared/http.ts";
import { activeBenefits, publicOrderSnapshot } from "../_shared/orders.ts";
import { cleanText, sha256 } from "../_shared/security.ts";
import { admin, getOptionalUser } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const options = handleOptions(req);
  if (options) return options;

  try {
    assertPost(req);
    const body = await req.json().catch(() => ({}));
    const user = await getOptionalUser(req);
    const accessRows = Array.isArray(body?.guestAccesses)
      ? body.guestAccesses.slice(0, 30)
      : [];

    const orderMap = new Map<string, any>();

    if (user?.id) {
      const { data, error } = await admin
        .from("public_orders")
        .select(
          "id,reference,access_token_hash,auth_user_id,status,checkout_id,checkout_reference,snapshot,created_at,paid_at",
        )
        .eq("auth_user_id", user.id)
        .eq("status", "paid")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      for (const row of data ?? []) orderMap.set(row.id, row);
    }

    for (const access of accessRows) {
      const orderId = cleanText(access?.orderId, 80);
      const accessToken = cleanText(access?.accessToken, 256);
      if (!orderId || !accessToken) continue;

      const { data, error } = await admin
        .from("public_orders")
        .select(
          "id,reference,access_token_hash,auth_user_id,status,checkout_id,checkout_reference,snapshot,created_at,paid_at",
        )
        .eq("id", orderId)
        .eq("status", "paid")
        .maybeSingle();

      if (error) throw error;
      if (!data) continue;
      if ((await sha256(accessToken)) !== data.access_token_hash) continue;
      orderMap.set(data.id, data);
    }

    const benefits = await activeBenefits();
    const orders = Array.from(orderMap.values())
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
      .map((order) => publicOrderSnapshot(order, benefits));

    return jsonResponse({ ok: true, orders });
  } catch (error) {
    return asHttpResponse(error);
  }
});
