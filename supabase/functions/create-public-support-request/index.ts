import {
  asHttpResponse,
  assertPost,
  handleOptions,
  jsonResponse,
  HttpError,
} from "../_shared/http.ts";
import { sendSupportNotification } from "../_shared/notifications.ts";
import { cleanText, normalizePhone } from "../_shared/security.ts";
import { admin, getOptionalUser } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const options = handleOptions(req);
  if (options) return options;

  try {
    assertPost(req);
    const body = await req.json();
    const user = await getOptionalUser(req);
    const name = cleanText(body?.name, 120, true);
    const email = cleanText(body?.email, 180) || null;
    const topic = cleanText(body?.topic, 100, true);
    const message = cleanText(body?.message, 4000, true);
    const orderReference = cleanText(body?.orderReference, 80) || null;

    let phoneCode: string | null = null;
    let phone: string | null = null;
    if (body?.phone) {
      const normalized = normalizePhone(body?.phoneCode, body?.phone);
      phoneCode = normalized.phoneCode;
      phone = normalized.phone;
    }

    if (!email && !phone) {
      throw new HttpError(
        400,
        "CONTACT_REQUIRED",
        "Ajoutez un e-mail ou un numéro de téléphone.",
      );
    }

    const { data, error } = await admin
      .from("public_support_requests")
      .insert({
        auth_user_id: user?.id ?? null,
        order_reference: orderReference,
        name,
        email,
        phone_code: phoneCode,
        phone,
        topic,
        message,
        source: "website",
      })
      .select("id,created_at")
      .single();

    if (error) throw error;

    try {
      await sendSupportNotification({
        requestId: data.id,
        name,
        topic,
      });
    } catch (notificationError) {
      console.error("Support enregistré, notification non envoyée", notificationError);
    }

    return jsonResponse({
      ok: true,
      requestId: data.id,
      createdAt: data.created_at,
    });
  } catch (error) {
    return asHttpResponse(error);
  }
});
