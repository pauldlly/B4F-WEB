import type {
  AffiliateContext,
  AffiliateScopeType,
} from "../types";

export const AFFILIATE_STORAGE_KEY =
  "b4f-web-affiliate-v11";

const RESERVED_SEGMENTS =
  new Set([
    "events",
    "packs",
    "experience",
    "about",
    "aide",
    "contact",
    "support",
    "faq",
    "rejoindre",
    "barcelona",
    "event",
    "pack",
    "checkout",
    "paiement",
    "mes-billets",
    "commande",
    "compte",
    "auth",
    "cgv",
    "confidentialite",
    "mentions-legales",
    "cookies",
    "remboursements",
  ]);

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const EMPTY_AFFILIATE:
  AffiliateContext = {
    promoterReference:
      null,

    scopeType:
      null,

    scopeId:
      null,
  };

function decodeSegment(
  value:
    string,
) {
  try {
    return decodeURIComponent(
      value,
    ).trim();
  } catch {
    return value.trim();
  }
}

function sanitizeReference(
  value:
    string |
    null |
    undefined,
) {
  const reference =
    String(
      value ??
      "",
    )
      .trim()
      .toLowerCase();

  return reference ||
    null;
}

function isValidEventId(
  value:
    string,
) {
  if (
    !/^\d+$/.test(
      value,
    )
  ) {
    return false;
  }

  const id =
    Number(
      value,
    );

  return (
    Number.isFinite(
      id,
    ) &&
    id >
      0
  );
}

function buildAffiliate(
  promoterReference:
    string,
  scopeType:
    AffiliateScopeType,
  scopeId:
    string |
    null,
): AffiliateContext {
  return {
    promoterReference:
      sanitizeReference(
        promoterReference,
      ),

    scopeType,

    scopeId:
      scopeId
        ? String(
            scopeId,
          )
        : null,
  };
}

/*
 * Formats pris en charge :
 *
 * GÉNÉRAL
 * /paul-dailly
 *
 * EVENT COMPACT
 * /paul-dailly:66
 *
 * PACK COMPACT
 * /paul-dailly:550e8400-e29b-41d4-a716-446655440000
 *
 * ANCIENS LIENS CONSERVÉS
 * /paul-dailly/event/66
 * /paul-dailly/pack/UUID
 *
 * ANCIENS LIENS ?ref= CONSERVÉS
 * /event/66?ref=paul-dailly
 * /pack/UUID?ref=paul-dailly
 */
export function affiliateFromUrl(
  pathname:
    string,
  search =
    "",
): AffiliateContext | null {
  const params =
    new URLSearchParams(
      search,
    );

  const queryReference =
    sanitizeReference(
      params.get(
        "ref",
      ),
    );

  const segments =
    pathname
      .split(
        "/",
      )
      .map(
        (
          segment,
        ) =>
          decodeSegment(
            segment,
          ),
      )
      .filter(
        Boolean,
      );

  /*
   * Ancien format :
   * /promoteur/event/66
   */
  if (
    segments.length >=
      3 &&
    segments[1] ===
      "event" &&
    isValidEventId(
      segments[2],
    )
  ) {
    return buildAffiliate(
      queryReference ||
        segments[0],
      "event",
      String(
        Number(
          segments[2],
        ),
      ),
    );
  }

  /*
   * Ancien format :
   * /promoteur/pack/UUID
   */
  if (
    segments.length >=
      3 &&
    segments[1] ===
      "pack" &&
    UUID_REGEX.test(
      segments[2],
    )
  ) {
    return buildAffiliate(
      queryReference ||
        segments[0],
      "pack",
      segments[2],
    );
  }

  /*
   * Format classique avec ?ref :
   * /event/66?ref=promoteur
   */
  if (
    queryReference &&
    segments.length >=
      2 &&
    segments[0] ===
      "event" &&
    isValidEventId(
      segments[1],
    )
  ) {
    return buildAffiliate(
      queryReference,
      "event",
      String(
        Number(
          segments[1],
        ),
      ),
    );
  }

  /*
   * Format classique avec ?ref :
   * /pack/UUID?ref=promoteur
   */
  if (
    queryReference &&
    segments.length >=
      2 &&
    segments[0] ===
      "pack" &&
    UUID_REGEX.test(
      segments[1],
    )
  ) {
    return buildAffiliate(
      queryReference,
      "pack",
      segments[1],
    );
  }

  /*
   * Nouveau format compact :
   *
   * /paul-dailly:66
   * /paul-dailly:UUID_PACK
   */
  if (
    segments.length ===
    1
  ) {
    const compact =
      segments[0];

    const separatorIndex =
      compact.lastIndexOf(
        ":",
      );

    if (
      separatorIndex >
        0 &&
      separatorIndex <
        compact.length -
          1
    ) {
      const promoterReference =
        sanitizeReference(
          compact.slice(
            0,
            separatorIndex,
          ),
        );

      const targetId =
        compact
          .slice(
            separatorIndex +
              1,
          )
          .trim();

      if (
        promoterReference &&
        isValidEventId(
          targetId,
        )
      ) {
        return buildAffiliate(
          promoterReference,
          "event",
          String(
            Number(
              targetId,
            ),
          ),
        );
      }

      if (
        promoterReference &&
        UUID_REGEX.test(
          targetId,
        )
      ) {
        return buildAffiliate(
          promoterReference,
          "pack",
          targetId,
        );
      }
    }
  }

  /*
   * Lien générique :
   *
   * /paul-dailly
   *
   * Le client peut ensuite naviguer librement
   * sur tout le site.
   */
  if (
    segments.length ===
      1 &&
    !RESERVED_SEGMENTS.has(
      segments[0].toLowerCase(),
    )
  ) {
    return buildAffiliate(
      queryReference ||
        segments[0],
      "general",
      null,
    );
  }

  /*
   * Ancien format :
   * /?ref=promoteur
   */
  if (
    queryReference
  ) {
    return buildAffiliate(
      queryReference,
      "general",
      null,
    );
  }

  return null;
}

export function loadStoredAffiliate():
  AffiliateContext {
  if (
    typeof window ===
    "undefined"
  ) {
    return EMPTY_AFFILIATE;
  }

  try {
    const raw =
      window.sessionStorage.getItem(
        AFFILIATE_STORAGE_KEY,
      );

    if (
      !raw
    ) {
      return EMPTY_AFFILIATE;
    }

    const value =
      JSON.parse(
        raw,
      ) as AffiliateContext;

    const promoterReference =
      sanitizeReference(
        value.promoterReference,
      );

    const scopeType =
      [
        "general",
        "event",
        "pack",
      ].includes(
        String(
          value.scopeType,
        ),
      )
        ? value.scopeType as AffiliateScopeType
        : null;

    const scopeId =
      typeof value.scopeId ===
        "string" &&
      value.scopeId.trim()
        ? value.scopeId.trim()
        : null;

    if (
      !promoterReference ||
      !scopeType
    ) {
      return EMPTY_AFFILIATE;
    }

    return {
      promoterReference,
      scopeType,
      scopeId,
    };
  } catch {
    return EMPTY_AFFILIATE;
  }
}

export function saveAffiliate(
  affiliate:
    AffiliateContext,
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  if (
    !affiliate.promoterReference ||
    !affiliate.scopeType
  ) {
    return;
  }

  try {
    window.sessionStorage.setItem(
      AFFILIATE_STORAGE_KEY,
      JSON.stringify(
        affiliate,
      ),
    );
  } catch {
    // Aucun blocage du parcours client.
  }
}

export function clearStoredAffiliate() {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  try {
    window.sessionStorage.removeItem(
      AFFILIATE_STORAGE_KEY,
    );
  } catch {
    // Rien à faire.
  }
}

/*
 * Sert uniquement à autoriser l'ouverture
 * d'un élément "app only" avec SON lien spécifique.
 *
 * Le lien générique ne révèle pas les éléments
 * cachés du catalogue web.
 */
export function hasStoredAffiliateAccess(
  scopeType:
    "event" |
    "pack",
  scopeId:
    string,
) {
  const affiliate =
    loadStoredAffiliate();

  return Boolean(
    affiliate.promoterReference &&
    affiliate.scopeType ===
      scopeType &&
    affiliate.scopeId ===
      String(
        scopeId,
      ),
  );
}
