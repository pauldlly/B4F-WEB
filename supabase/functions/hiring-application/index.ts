import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

/* =========================================================
   ENV
========================================================= */

const RESEND_API_KEY =
  Deno.env
    .get("RESEND_API_KEY")
    ?.trim();

const HIRING_EMAIL =
  Deno.env
    .get("HIRING_EMAIL")
    ?.trim() ||
  "contact.b4fevents@gmail.com";

/*
 * Même fonctionnement que ton formulaire Support.
 *
 * Tant que b4f-events.com n'est pas vérifié
 * chez Resend, on utilise onboarding@resend.dev.
 */
const HIRING_FROM_EMAIL =
  Deno.env
    .get("HIRING_FROM_EMAIL")
    ?.trim() ||
  "B4F Recrutement <onboarding@resend.dev>";

/*
 * Resend limite la taille totale d'un e-mail.
 * Le Base64 augmente aussi la taille des fichiers.
 *
 * 25 Mo bruts = marge de sécurité raisonnable.
 */
const MAX_ATTACHMENTS_SIZE =
  25 * 1024 * 1024;


/* =========================================================
   CORS
========================================================= */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",

  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",

  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};


/* =========================================================
   RESPONSE
========================================================= */

function jsonResponse(
  data: unknown,
  status = 200,
) {
  return new Response(
    JSON.stringify(data),
    {
      status,

      headers: {
        ...corsHeaders,

        "Content-Type":
          "application/json",
      },
    },
  );
}


/* =========================================================
   SECURITY
========================================================= */

function escapeHtml(
  value:
    | string
    | null
    | undefined,
) {
  return String(
    value ?? "",
  )
    .replace(
      /&/g,
      "&amp;",
    )
    .replace(
      /</g,
      "&lt;",
    )
    .replace(
      />/g,
      "&gt;",
    )
    .replace(
      /"/g,
      "&quot;",
    )
    .replace(
      /'/g,
      "&#039;",
    );
}


function formatMultiline(
  value:
    | string
    | null
    | undefined,
) {
  return escapeHtml(
    value,
  ).replace(
    /\n/g,
    "<br>",
  );
}


/* =========================================================
   FORM HELPERS
========================================================= */

function getString(
  formData: FormData,
  key: string,
) {
  return String(
    formData.get(key) ??
      "",
  ).trim();
}


/* =========================================================
   FILE -> BASE64
========================================================= */

async function fileToBase64(
  file: File,
) {
  const buffer =
    await file.arrayBuffer();

  const bytes =
    new Uint8Array(
      buffer,
    );

  let binary =
    "";

  const chunkSize =
    0x8000;

  for (
    let i = 0;
    i < bytes.length;
    i += chunkSize
  ) {
    const chunk =
      bytes.subarray(
        i,
        Math.min(
          i + chunkSize,
          bytes.length,
        ),
      );

    binary +=
      String.fromCharCode(
        ...chunk,
      );
  }

  return btoa(
    binary,
  );
}


/* =========================================================
   EDGE FUNCTION
========================================================= */

serve(
  async (
    req,
  ) => {
    /* =====================================================
       CORS PREFLIGHT
    ===================================================== */

    if (
      req.method ===
      "OPTIONS"
    ) {
      return new Response(
        "ok",
        {
          status: 200,
          headers:
            corsHeaders,
        },
      );
    }


    /* =====================================================
       METHOD
    ===================================================== */

    if (
      req.method !==
      "POST"
    ) {
      return jsonResponse(
        {
          error:
            "Method not allowed",
        },
        405,
      );
    }


    try {
      /* ===================================================
         ENV CHECK
      =================================================== */

      if (
        !RESEND_API_KEY
      ) {
        throw new Error(
          "RESEND_API_KEY manquante dans les secrets Supabase.",
        );
      }


      /* ===================================================
         FORM
      =================================================== */

      const formData =
        await req.formData();


      const firstName =
        getString(
          formData,
          "firstName",
        );

      const lastName =
        getString(
          formData,
          "lastName",
        );

      const age =
        getString(
          formData,
          "age",
        );

      const phoneCode =
        getString(
          formData,
          "phoneCode",
        );

      const phone =
        getString(
          formData,
          "phone",
        );

      const email =
        getString(
          formData,
          "email",
        );

      const instagram =
        getString(
          formData,
          "instagram",
        );

      const role =
        getString(
          formData,
          "role",
        );

      const startDate =
        getString(
          formData,
          "startDate",
        );

      const endDate =
        getString(
          formData,
          "endDate",
        );

      const housingNeeded =
        getString(
          formData,
          "housingNeeded",
        );

      const housingStartDate =
        getString(
          formData,
          "housingStartDate",
        );

      const housingEndDate =
        getString(
          formData,
          "housingEndDate",
        );

      const languages =
        getString(
          formData,
          "languages",
        );

      const experience =
        getString(
          formData,
          "experience",
        );

      const message =
        getString(
          formData,
          "message",
        );

      const portfolioLinks =
        getString(
          formData,
          "portfolioLinks",
        );


      /* ===================================================
         REQUIRED
      =================================================== */

      if (
        !firstName
      ) {
        return jsonResponse(
          {
            error:
              "Le prénom est obligatoire.",
          },
          400,
        );
      }

      if (
        !lastName
      ) {
        return jsonResponse(
          {
            error:
              "Le nom est obligatoire.",
          },
          400,
        );
      }

      if (
        !email
      ) {
        return jsonResponse(
          {
            error:
              "L’adresse e-mail est obligatoire.",
          },
          400,
        );
      }

      if (
        !role
      ) {
        return jsonResponse(
          {
            error:
              "Le poste recherché est obligatoire.",
          },
          400,
        );
      }


      /* ===================================================
         EMAIL CHECK
      =================================================== */

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailRegex.test(
          email,
        )
      ) {
        return jsonResponse(
          {
            error:
              "Adresse e-mail invalide.",
          },
          400,
        );
      }


      /* ===================================================
         ATTACHMENTS
      =================================================== */

      const files: File[] =
        [];


      /*
       * CV
       */
      const cv =
        formData.get(
          "cv",
        );

      if (
        cv instanceof File &&
        cv.size > 0
      ) {
        files.push(
          cv,
        );
      }


      /*
       * Vidéo promoteur
       */
      const presentationVideo =
        formData.get(
          "presentationVideo",
        );

      if (
        presentationVideo instanceof
          File &&
        presentationVideo.size >
          0
      ) {
        files.push(
          presentationVideo,
        );
      }


      /*
       * Réalisations
       */
      const workSamples =
        formData.getAll(
          "workSamples",
        );

      for (
        const item of
        workSamples
      ) {
        if (
          item instanceof File &&
          item.size > 0
        ) {
          files.push(
            item,
          );
        }
      }


      /* ===================================================
         TOTAL FILE SIZE
      =================================================== */

      const totalFileSize =
        files.reduce(
          (
            total,
            file,
          ) =>
            total +
            file.size,
          0,
        );

      if (
        totalFileSize >
        MAX_ATTACHMENTS_SIZE
      ) {
        return jsonResponse(
          {
            error:
              "Les fichiers joints sont trop volumineux. Le total ne doit pas dépasser 25 Mo.",
          },
          413,
        );
      }


      /* ===================================================
         CONVERT ATTACHMENTS
      =================================================== */

      const attachments: {
        filename: string;
        content: string;
      }[] = [];


      for (
        const file of
        files
      ) {
        const content =
          await fileToBase64(
            file,
          );

        attachments.push(
          {
            filename:
              file.name,

            content,
          },
        );
      }


      /* ===================================================
         PHONE DISPLAY
      =================================================== */

      const fullPhone =
        phone
          ? `${phoneCode} ${phone}`.trim()
          : "Non renseigné";


      /* ===================================================
         SAFE VALUES
      =================================================== */

      const safeFirstName =
        escapeHtml(
          firstName,
        );

      const safeLastName =
        escapeHtml(
          lastName,
        );

      const safeAge =
        escapeHtml(
          age ||
            "Non renseigné",
        );

      const safePhone =
        escapeHtml(
          fullPhone,
        );

      const safeEmail =
        escapeHtml(
          email,
        );

      const safeInstagram =
        escapeHtml(
          instagram ||
            "Non renseigné",
        );

      const safeRole =
        escapeHtml(
          role,
        );

      const safeStartDate =
        escapeHtml(
          startDate ||
            "Non renseignée",
        );

      const safeEndDate =
        escapeHtml(
          endDate ||
            "Non renseignée",
        );

      const safeHousingStartDate =
        escapeHtml(
          housingStartDate ||
            "Non renseignée",
        );

      const safeHousingEndDate =
        escapeHtml(
          housingEndDate ||
            "Non renseignée",
        );

      const safeLanguages =
        formatMultiline(
          languages ||
            "Non renseignées",
        );

      const safeExperience =
        formatMultiline(
          experience ||
            "Non renseignée",
        );

      const safeMessage =
        formatMultiline(
          message ||
            "Non renseigné",
        );

      const safePortfolio =
        formatMultiline(
          portfolioLinks,
        );


      /* ===================================================
         REPLY BUTTON
      =================================================== */

      const replyUrl =
        `mailto:${email}?subject=${encodeURIComponent(
          `Re: Candidature B4F — ${firstName} ${lastName}`,
        )}`;

      const safeReplyUrl =
        escapeHtml(
          replyUrl,
        );


      /* ===================================================
         HTML
      =================================================== */

      const html = `
<!doctype html>

<html lang="fr">

<head>

  <meta
    charset="UTF-8"
  />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>
    Nouvelle candidature B4F
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
  width="650"
  cellpadding="0"
  cellspacing="0"
  border="0"
  style="
    width:100%;
    max-width:650px;
  "
>


<!-- =====================================================
     CARD
===================================================== -->

<tr>

<td
  style="
    overflow:hidden;
    background:#121212;
    border:1px solid #292929;
    border-radius:24px;
  "
>


<!-- TOP LINE -->

<div
  style="
    height:4px;
    background:#ff724d;
  "
></div>


<div
  style="
    padding:32px;
  "
>


<!-- LABEL -->

<div
  style="
    color:#ff794d;
    font-size:10px;
    line-height:16px;
    font-weight:700;
    letter-spacing:2px;
    text-transform:uppercase;
  "
>
  NOUVELLE CANDIDATURE
</div>


<!-- NAME -->

<h1
  style="
    margin:8px 0 0 0;
    color:#ffffff;
    font-size:30px;
    line-height:36px;
    letter-spacing:-1px;
  "
>
  ${safeFirstName}
  ${safeLastName}
</h1>


<!-- ROLE -->

<div
  style="
    margin-top:10px;
    color:#9a9a9a;
    font-size:14px;
    line-height:22px;
  "
>
  Candidature pour

  <strong
    style="
      color:#ffffff;
    "
  >
    ${safeRole}
  </strong>
</div>


<!-- =====================================================
     PROFILE
===================================================== -->

<div
  style="
    margin-top:30px;
    padding-top:26px;
    border-top:1px solid #292929;
  "
>

<div
  style="
    margin-bottom:18px;
    color:#ff794d;
    font-size:10px;
    font-weight:700;
    letter-spacing:1.8px;
    text-transform:uppercase;
  "
>
  PROFIL
</div>


<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  border="0"
>


<tr>

<td
  style="
    width:145px;
    padding-bottom:14px;
    color:#666666;
    font-size:12px;
  "
>
  Âge
</td>

<td
  style="
    padding-bottom:14px;
    color:#ffffff;
    font-size:13px;
  "
>
  ${safeAge}
</td>

</tr>


<tr>

<td
  style="
    width:145px;
    padding-bottom:14px;
    color:#666666;
    font-size:12px;
  "
>
  Téléphone
</td>

<td
  style="
    padding-bottom:14px;
    color:#ffffff;
    font-size:13px;
  "
>

<a
  href="tel:${safePhone}"
  style="
    color:#ffffff;
    text-decoration:none;
  "
>
  ${safePhone}
</a>

</td>

</tr>


<tr>

<td
  style="
    width:145px;
    padding-bottom:14px;
    color:#666666;
    font-size:12px;
  "
>
  E-mail
</td>

<td
  style="
    padding-bottom:14px;
    color:#ffffff;
    font-size:13px;
  "
>

<a
  href="mailto:${safeEmail}"
  style="
    color:#ffffff;
    text-decoration:none;
  "
>
  ${safeEmail}
</a>

</td>

</tr>


<tr>

<td
  style="
    width:145px;
    color:#666666;
    font-size:12px;
  "
>
  Instagram
</td>

<td
  style="
    color:#ffffff;
    font-size:13px;
  "
>
  ${safeInstagram}
</td>

</tr>


</table>

</div>


<!-- =====================================================
     AVAILABILITY
===================================================== -->

<div
  style="
    margin-top:30px;
    padding-top:26px;
    border-top:1px solid #292929;
  "
>

<div
  style="
    margin-bottom:18px;
    color:#ff794d;
    font-size:10px;
    font-weight:700;
    letter-spacing:1.8px;
    text-transform:uppercase;
  "
>
  DISPONIBILITÉS
</div>


<p
  style="
    margin:0 0 15px;
    color:#ffffff;
    font-size:14px;
    line-height:24px;
  "
>
  <strong>
    Disponible du
  </strong>

  <br />

  ${safeStartDate}
  →
  ${safeEndDate}
</p>


<p
  style="
    margin:0;
    color:#ffffff;
    font-size:14px;
    line-height:24px;
  "
>

<strong>
  Besoin d’un logement :
</strong>

${
  housingNeeded ===
  "yes"
    ? "Oui"
    : "Non"
}

</p>


${
  housingNeeded ===
  "yes"
    ? `
      <p
        style="
          margin:15px 0 0;
          color:#ffffff;
          font-size:14px;
          line-height:24px;
        "
      >

        <strong>
          Logement souhaité du
        </strong>

        <br />

        ${safeHousingStartDate}
        →
        ${safeHousingEndDate}

      </p>
    `
    : ""
}

</div>


<!-- =====================================================
     LANGUAGES
===================================================== -->

<div
  style="
    margin-top:30px;
    padding-top:26px;
    border-top:1px solid #292929;
  "
>

<div
  style="
    margin-bottom:10px;
    color:#777777;
    font-size:10px;
    font-weight:700;
    letter-spacing:1.6px;
    text-transform:uppercase;
  "
>
  LANGUES
</div>

<div
  style="
    color:#eeeeee;
    font-size:14px;
    line-height:24px;
  "
>
  ${safeLanguages}
</div>

</div>


<!-- =====================================================
     EXPERIENCE
===================================================== -->

<div
  style="
    margin-top:25px;
    padding:20px;
    background:#090909;
    border:1px solid #222222;
    border-radius:18px;
  "
>

<div
  style="
    margin-bottom:10px;
    color:#777777;
    font-size:10px;
    font-weight:700;
    letter-spacing:1.6px;
    text-transform:uppercase;
  "
>
  EXPÉRIENCE
</div>

<div
  style="
    color:#eeeeee;
    font-size:14px;
    line-height:25px;
  "
>
  ${safeExperience}
</div>

</div>


<!-- =====================================================
     MOTIVATION
===================================================== -->

<div
  style="
    margin-top:14px;
    padding:20px;
    background:#090909;
    border:1px solid #222222;
    border-radius:18px;
  "
>

<div
  style="
    margin-bottom:10px;
    color:#777777;
    font-size:10px;
    font-weight:700;
    letter-spacing:1.6px;
    text-transform:uppercase;
  "
>
  POURQUOI B4F ?
</div>

<div
  style="
    color:#eeeeee;
    font-size:14px;
    line-height:25px;
  "
>
  ${safeMessage}
</div>

</div>


${
  portfolioLinks
    ? `
      <div
        style="
          margin-top:14px;
          padding:20px;
          background:#090909;
          border:1px solid #222222;
          border-radius:18px;
        "
      >

        <div
          style="
            margin-bottom:10px;
            color:#777777;
            font-size:10px;
            font-weight:700;
            letter-spacing:1.6px;
            text-transform:uppercase;
          "
        >
          PORTFOLIO / LIENS
        </div>

        <div
          style="
            color:#eeeeee;
            font-size:14px;
            line-height:25px;
          "
        >
          ${safePortfolio}
        </div>

      </div>
    `
    : ""
}


<!-- =====================================================
     FILES
===================================================== -->

${
  attachments.length
    ? `
      <div
        style="
          margin-top:24px;
          padding:17px 20px;
          background:#191919;
          border:1px solid #292929;
          border-radius:15px;
          color:#bdbdbd;
          font-size:13px;
          line-height:21px;
        "
      >

        <strong
          style="
            color:#ffffff;
          "
        >
          ${attachments.length}
          fichier${
            attachments.length >
            1
              ? "s"
              : ""
          }
          joint${
            attachments.length >
            1
              ? "s"
              : ""
          }
        </strong>

        <br />

        ${attachments
          .map(
            (
              attachment,
            ) =>
              escapeHtml(
                attachment.filename,
              ),
          )
          .join(
            "<br />",
          )}

      </div>
    `
    : ""
}


<!-- =====================================================
     REPLY
===================================================== -->

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
  Répondre au candidat →
</a>

</div>


</div>

</td>

</tr>


<!-- =====================================================
     FOOTER
===================================================== -->

<tr>

<td
  align="center"
  style="
    padding:20px 10px 0;
    color:#555555;
    font-size:10px;
    line-height:17px;
  "
>

Candidature envoyée depuis
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
      `;


      /* ===================================================
         TEXT FALLBACK
      =================================================== */

      const text = `
B4F EVENTS
Nouvelle candidature

Prénom :
${firstName}

Nom :
${lastName}

Âge :
${age || "Non renseigné"}

Poste :
${role}

Téléphone :
${fullPhone}

E-mail :
${email}

Instagram :
${instagram || "Non renseigné"}

Disponibilités :
${startDate || "Non renseignée"} → ${endDate || "Non renseignée"}

Besoin d'un logement :
${
  housingNeeded ===
  "yes"
    ? "Oui"
    : "Non"
}

${
  housingNeeded ===
  "yes"
    ? `Dates logement :
${housingStartDate} → ${housingEndDate}`
    : ""
}

Langues :
${languages || "Non renseignées"}

Expérience :
${experience || "Non renseignée"}

Pourquoi B4F :
${message || "Non renseigné"}

Portfolio :
${portfolioLinks || "Non renseigné"}
      `.trim();


      /* ===================================================
         SEND RESEND
      =================================================== */

      const resendResponse =
        await fetch(
          "https://api.resend.com/emails",
          {
            method:
              "POST",

            headers: {
              Authorization:
                `Bearer ${RESEND_API_KEY}`,

              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                {
                  from:
                    HIRING_FROM_EMAIL,

                  to: [
                    HIRING_EMAIL,
                  ],

                  /*
                   * Quand tu cliques
                   * sur Répondre dans Gmail,
                   * tu réponds au candidat.
                   */
                  reply_to:
                    email,

                  subject:
                    `B4F · Candidature · ${firstName} ${lastName} · ${role}`,

                  html,

                  text,

                  /*
                   * On n'ajoute la propriété
                   * que s'il y a réellement
                   * des fichiers.
                   */
                  ...(attachments.length
                    ? {
                        attachments,
                      }
                    : {}),
                },
              ),
          },
        );


      /* ===================================================
         RESEND RESPONSE
      =================================================== */

      let resendResult:
        Record<
          string,
          unknown
        > = {};


      try {
        resendResult =
          await resendResponse
            .json();
      } catch {
        resendResult = {};
      }


      /* ===================================================
         RESEND ERROR
      =================================================== */

      if (
        !resendResponse.ok
      ) {
        console.error(
          "RESEND HIRING ERROR:",
          resendResult,
        );


        const resendMessage =
          typeof resendResult
            ?.message ===
          "string"
            ? resendResult
                .message
            : "L’e-mail n’a pas pu être envoyé.";


        return jsonResponse(
          {
            error:
              `Resend : ${resendMessage}`,
          },
          500,
        );
      }


      /* ===================================================
         SUCCESS
      =================================================== */

      console.log(
        "Candidature B4F envoyée",
        {
          firstName,
          lastName,
          role,
          email,

          resendId:
            resendResult
              ?.id,
        },
      );


      return jsonResponse(
        {
          success: true,

          message:
            "Ta candidature a bien été envoyée.",
        },
        200,
      );
    } catch (
      error
    ) {
      console.error(
        "HIRING APPLICATION ERROR:",
        error,
      );


      return jsonResponse(
        {
          error:
            error instanceof
              Error
              ? error.message
              : "Une erreur est survenue pendant l’envoi de la candidature.",
        },
        500,
      );
    }
  },
);