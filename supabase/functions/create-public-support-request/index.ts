import {
  asHttpResponse,
  assertPost,
  handleOptions,
  jsonResponse,
  HttpError,
} from "../_shared/http.ts";

import {
  sendSupportNotification,
} from "../_shared/notifications.ts";

import {
  cleanText,
  normalizePhone,
} from "../_shared/security.ts";

import {
  admin,
  getOptionalUser,
} from "../_shared/supabase.ts";

/*
 * Sécurise les valeurs insérées
 * dans le HTML de l'e-mail.
 */
function escapeHtml(
  value: string | null | undefined,
) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/*
 * Envoi de l'e-mail support via Resend.
 */
async function sendSupportEmail({
  requestId,
  name,
  email,
  phoneCode,
  phone,
  topic,
  orderReference,
  message,
}: {
  requestId: string;
  name: string;
  email: string | null;
  phoneCode: string | null;
  phone: string | null;
  topic: string;
  orderReference: string | null;
  message: string;
}) {
  const resendApiKey =
    Deno.env
      .get("RESEND_API_KEY")
      ?.trim();

  const supportEmail =
    Deno.env
      .get("SUPPORT_EMAIL")
      ?.trim();

  const supportFromEmail =
    Deno.env
      .get("SUPPORT_FROM_EMAIL")
      ?.trim() ||
    "B4F Support <onboarding@resend.dev>";

  if (
    !resendApiKey ||
    !supportEmail
  ) {
    console.warn(
      "RESEND_API_KEY ou SUPPORT_EMAIL absent.",
    );

    return {
      ok: false,
      skipped: true,
    };
  }

  const fullPhone =
    phone
      ? `${phoneCode ?? ""}${phone}`
      : null;

  /*
   * Valeurs sécurisées pour le HTML.
   */
  const safeName =
    escapeHtml(name);

  const safeEmail =
    escapeHtml(email);

  const safePhone =
    escapeHtml(fullPhone);

  const safeTopic =
    escapeHtml(topic);

  const safeReference =
    escapeHtml(
      orderReference,
    );

  const safeMessage =
    escapeHtml(message)
      .replace(
        /\n/g,
        "<br>",
      );

  const safeRequestId =
    escapeHtml(
      requestId,
    );

  /*
   * IMPORTANT :
   *
   * On ne fait PAS encodeURIComponent(email)
   * sur l'adresse elle-même.
   *
   * Sinon Gmail peut ne pas comprendre
   * correctement le destinataire.
   */
  const replyUrl =
    email
      ? `mailto:${email}?subject=${encodeURIComponent(
          `Re: Demande B4F - ${topic}`,
        )}`
      : null;

  /*
   * Sécurisation uniquement pour
   * l'insertion dans l'attribut HTML href.
   */
  const safeReplyUrl =
    replyUrl
      ? escapeHtml(
          replyUrl,
        )
      : null;

  const response =
    await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${resendApiKey}`,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          from:
            supportFromEmail,

          to: [
            supportEmail,
          ],

          /*
           * Quand tu cliques sur
           * "Répondre" directement
           * dans Gmail, la réponse
           * part également vers le client.
           */
          ...(email
            ? {
                reply_to:
                  email,
              }
            : {}),

          subject:
            `B4F · ${topic} · ${name}`,

          html: `
<!doctype html>

<html lang="fr">

<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>
    Nouvelle demande support B4F
  </title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#080808;
    font-family:Arial,Helvetica,sans-serif;
    color:#ffffff;
  "
>

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  border="0"
  style="
    width:100%;
    background:#080808;
  "
>

<tr>

<td
  align="center"
  style="
    padding:40px 16px;
  "
>

<table
  width="620"
  cellpadding="0"
  cellspacing="0"
  border="0"
  style="
    width:100%;
    max-width:620px;
  "
>

  <!-- MAIN CARD -->
  <tr>

    <td
      style="
        background:#121212;
        border:1px solid #292929;
        border-radius:24px;
        overflow:hidden;
      "
    >

      <!-- ORANGE/PINK LINE -->
      <div
        style="
          height:4px;
          background:#ff724d;
        "
      ></div>


      <div
        style="
          padding:30px;
        "
      >

        <!-- LABEL -->
        <div
          style="
            font-size:10px;
            line-height:16px;
            font-weight:700;
            letter-spacing:2px;
            text-transform:uppercase;
            color:#ff794d;
          "
        >
          NOUVELLE DEMANDE
        </div>


        <!-- TOPIC -->
        <h1
          style="
            margin:8px 0 0 0;
            font-size:30px;
            line-height:36px;
            letter-spacing:-1px;
            color:#ffffff;
          "
        >
          ${safeTopic}
        </h1>


        <!-- USER -->
        <div
          style="
            margin-top:12px;
            font-size:14px;
            line-height:22px;
            color:#8f8f8f;
          "
        >

          Envoyée par

          <strong
            style="
              color:#ffffff;
            "
          >
            ${safeName}
          </strong>

        </div>


        <!-- MESSAGE -->
        <div
          style="
            margin-top:28px;
            padding:22px;
            background:#090909;
            border:1px solid #222222;
            border-radius:18px;
          "
        >

          <div
            style="
              margin-bottom:11px;
              font-size:10px;
              line-height:16px;
              font-weight:700;
              letter-spacing:1.6px;
              text-transform:uppercase;
              color:#686868;
            "
          >
            MESSAGE
          </div>

          <div
            style="
              font-size:16px;
              line-height:27px;
              color:#f4f4f4;
            "
          >
            ${safeMessage}
          </div>

        </div>


        <!-- CLIENT INFO -->
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            width:100%;
            margin-top:28px;
          "
        >

          <!-- EMAIL -->
          <tr>

            <td
              style="
                width:125px;
                padding-bottom:16px;
                font-size:12px;
                color:#696969;
              "
            >
              E-mail
            </td>

            <td
              style="
                padding-bottom:16px;
                font-size:13px;
                color:#ffffff;
              "
            >

              ${
                email
                  ? `
                    <a
                      href="mailto:${safeEmail}"
                      style="
                        color:#ffffff;
                        text-decoration:none;
                      "
                    >
                      ${safeEmail}
                    </a>
                  `
                  : "Non renseigné"
              }

            </td>

          </tr>


          <!-- PHONE -->
          <tr>

            <td
              style="
                width:125px;
                padding-bottom:16px;
                font-size:12px;
                color:#696969;
              "
            >
              Téléphone
            </td>

            <td
              style="
                padding-bottom:16px;
                font-size:13px;
                color:#ffffff;
              "
            >

              ${
                fullPhone
                  ? `
                    <a
                      href="tel:${safePhone}"
                      style="
                        color:#ffffff;
                        text-decoration:none;
                      "
                    >
                      ${safePhone}
                    </a>
                  `
                  : "Non renseigné"
              }

            </td>

          </tr>


          <!-- ORDER -->
          <tr>

            <td
              style="
                width:125px;
                padding-bottom:16px;
                font-size:12px;
                color:#696969;
              "
            >
              Commande
            </td>

            <td
              style="
                padding-bottom:16px;
                font-size:13px;
                color:#ffffff;
              "
            >
              ${
                safeReference ||
                "Aucune"
              }
            </td>

          </tr>


          <!-- REQUEST ID -->
          <tr>

            <td
              style="
                width:125px;
                font-size:12px;
                color:#696969;
              "
            >
              Référence
            </td>

            <td
              style="
                font-family:monospace;
                font-size:11px;
                color:#888888;
              "
            >
              ${safeRequestId}
            </td>

          </tr>

        </table>


        <!-- REPLY BUTTON -->
        ${
          safeReplyUrl
            ? `
              <div
                style="
                  margin-top:30px;
                "
              >

                <a
                  href="${safeReplyUrl}"
                  style="
                    display:inline-block;
                    padding:15px 23px;
                    background:#ffffff;
                    border-radius:13px;
                    color:#000000;
                    font-size:13px;
                    font-weight:700;
                    text-decoration:none;
                  "
                >
                  Répondre au client →
                </a>

              </div>
            `
            : ""
        }

      </div>

    </td>

  </tr>


  <!-- FOOTER -->
  <tr>

    <td
      align="center"
      style="
        padding:20px 10px 0;
        font-size:10px;
        line-height:17px;
        color:#555555;
      "
    >

      Demande envoyée depuis
      www.b4f-events.com

      <br />

      B4F EVENTS · Barcelona

    </td>

  </tr>

</table>

</td>

</tr>

</table>

</body>

</html>
          `,

          /*
           * Version texte si le client mail
           * n'affiche pas le HTML.
           */
          text: `
B4F EVENTS
Nouvelle demande support

Sujet :
${topic}

Nom :
${name}

Message :
${message}

E-mail :
${email || "Non renseigné"}

Téléphone :
${fullPhone || "Non renseigné"}

Commande :
${orderReference || "Aucune"}

Référence :
${requestId}
          `.trim(),
        }),
      },
    );

  if (
    !response.ok
  ) {
    const responseText =
      await response.text();

    throw new Error(
      `Resend ${response.status}: ${responseText}`,
    );
  }

  return {
    ok: true,
  };
}


/*
 * EDGE FUNCTION
 */
Deno.serve(
  async (req) => {
    const options =
      handleOptions(req);

    if (options) {
      return options;
    }

    try {
      assertPost(req);

      const body =
        await req.json();

      const user =
        await getOptionalUser(
          req,
        );


      /*
       * DONNÉES CLIENT
       */
      const name =
        cleanText(
          body?.name,
          120,
          true,
        );

      const email =
        cleanText(
          body?.email,
          180,
        ) || null;

      const topic =
        cleanText(
          body?.topic,
          100,
          true,
        );

      const message =
        cleanText(
          body?.message,
          4000,
          true,
        );

      const orderReference =
        cleanText(
          body?.orderReference,
          80,
        ) || null;


      /*
       * TÉLÉPHONE
       */
      let phoneCode:
        | string
        | null =
        null;

      let phone:
        | string
        | null =
        null;

      if (
        body?.phone
      ) {
        const normalized =
          normalizePhone(
            body?.phoneCode,
            body?.phone,
          );

        phoneCode =
          normalized.phoneCode;

        phone =
          normalized.phone;
      }


      /*
       * EMAIL OU TÉLÉPHONE OBLIGATOIRE
       */
      if (
        !email &&
        !phone
      ) {
        throw new HttpError(
          400,
          "CONTACT_REQUIRED",
          "Ajoutez un e-mail ou un numéro de téléphone.",
        );
      }


      /*
       * 1. ENREGISTREMENT SUPABASE
       */
      const {
        data,
        error,
      } = await admin
        .from(
          "public_support_requests",
        )
        .insert({
          auth_user_id:
            user?.id ??
            null,

          order_reference:
            orderReference,

          name,

          email,

          phone_code:
            phoneCode,

          phone,

          topic,

          message,

          source:
            "website",
        })
        .select(
          "id,created_at",
        )
        .single();

      if (
        error
      ) {
        throw error;
      }


      /*
       * 2. PUSH AUX ADMINS
       *
       * Une erreur push ne doit
       * pas empêcher l'enregistrement.
       */
      try {
        await sendSupportNotification({
          requestId:
            data.id,

          name,

          topic,
        });
      } catch (
        notificationError
      ) {
        console.error(
          "Support enregistré, notification push non envoyée",
          notificationError,
        );
      }


      /*
       * 3. EMAIL
       *
       * Une erreur Resend ne doit
       * pas supprimer la demande.
       */
      try {
        await sendSupportEmail({
          requestId:
            data.id,

          name,

          email,

          phoneCode,

          phone,

          topic,

          orderReference,

          message,
        });
      } catch (
        emailError
      ) {
        console.error(
          "Support enregistré, email non envoyé",
          emailError,
        );
      }


      /*
       * 4. RÉPONSE FRONTEND
       */
      return jsonResponse({
        ok: true,

        requestId:
          data.id,

        createdAt:
          data.created_at,
      });
    } catch (
      error
    ) {
      return asHttpResponse(
        error,
      );
    }
  },
);