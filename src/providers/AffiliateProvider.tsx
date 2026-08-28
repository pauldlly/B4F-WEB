import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation } from "react-router-dom";

import type {
  AffiliateContext,
  AffiliateScopeType,
} from "../types";

const STORAGE_KEY = "b4f-web-affiliate-v10";
const RESERVED_SEGMENTS = new Set([
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

const EMPTY_AFFILIATE: AffiliateContext = {
  promoterReference: null,
  scopeType: null,
  scopeId: null,
};

type AffiliateContextValue = AffiliateContext & {
  clearAffiliate: () => void;
};

const AffiliateContextStore =
  createContext<AffiliateContextValue | null>(null);

function loadStoredAffiliate(): AffiliateContext {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_AFFILIATE;
    const value = JSON.parse(raw) as AffiliateContext;

    return {
      promoterReference:
        typeof value.promoterReference === "string"
          ? value.promoterReference
          : null,
      scopeType: ["general", "event", "pack"].includes(
        String(value.scopeType),
      )
        ? (value.scopeType as AffiliateScopeType)
        : null,
      scopeId:
        typeof value.scopeId === "string"
          ? value.scopeId
          : null,
    };
  } catch {
    return EMPTY_AFFILIATE;
  }
}

function affiliateFromUrl(
  pathname: string,
  search: string,
): AffiliateContext | null {
  const params = new URLSearchParams(search);
  const queryReference = params.get("ref")?.trim();
  const segments = pathname
    .split("/")
    .map((segment) => decodeURIComponent(segment.trim()))
    .filter(Boolean);

  if (segments.length >= 3 && segments[1] === "event") {
    return {
      promoterReference: queryReference || segments[0],
      scopeType: "event",
      scopeId: segments[2],
    };
  }

  if (segments.length >= 3 && segments[1] === "pack") {
    return {
      promoterReference: queryReference || segments[0],
      scopeType: "pack",
      scopeId: segments[2],
    };
  }

  if (queryReference) {
    return {
      promoterReference: queryReference,
      scopeType: "general",
      scopeId: null,
    };
  }

  if (
    segments.length === 1 &&
    !RESERVED_SEGMENTS.has(segments[0].toLowerCase())
  ) {
    return {
      promoterReference: segments[0],
      scopeType: "general",
      scopeId: null,
    };
  }

  return null;
}

export function AffiliateProvider({
  children,
}: {
  children: ReactNode;
}) {
  const location = useLocation();
  const [affiliate, setAffiliate] =
    useState<AffiliateContext>(loadStoredAffiliate);

  useEffect(() => {
    const next = affiliateFromUrl(
      location.pathname,
      location.search,
    );

    if (!next?.promoterReference) return;

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setAffiliate(next);
  }, [location.pathname, location.search]);

  const value = useMemo<AffiliateContextValue>(
    () => ({
      ...affiliate,
      clearAffiliate: () => {
        sessionStorage.removeItem(STORAGE_KEY);
        setAffiliate(EMPTY_AFFILIATE);
      },
    }),
    [affiliate],
  );

  return (
    <AffiliateContextStore.Provider value={value}>
      {children}
    </AffiliateContextStore.Provider>
  );
}

export function useAffiliate() {
  const value = useContext(AffiliateContextStore);

  if (!value) {
    throw new Error(
      "useAffiliate doit être utilisé dans AffiliateProvider.",
    );
  }

  return value;
}
