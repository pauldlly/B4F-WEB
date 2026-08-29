import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocation,
} from "react-router-dom";

import {
  affiliateFromUrl,
  clearStoredAffiliate,
  EMPTY_AFFILIATE,
  loadStoredAffiliate,
  saveAffiliate,
} from "../lib/affiliate";

import type {
  AffiliateContext,
} from "../types";

type AffiliateContextValue =
  AffiliateContext & {
    clearAffiliate:
      () => void;
  };

const AffiliateContextStore =
  createContext<
    AffiliateContextValue |
    null
  >(
    null,
  );

export function AffiliateProvider({
  children,
}: {
  children:
    ReactNode;
}) {
  const location =
    useLocation();

  const [
    affiliate,
    setAffiliate,
  ] =
    useState<AffiliateContext>(
      loadStoredAffiliate,
    );

  /*
   * À chaque navigation :
   *
   * - si l'URL contient une nouvelle affiliation,
   *   elle remplace l'ancienne ;
   *
   * - si l'URL n'en contient pas,
   *   l'affiliation déjà enregistrée reste active.
   *
   * C'est ce qui permet au client de se balader
   * sur le site sans perdre le promoteur.
   */
  useEffect(
    () => {
      const next =
        affiliateFromUrl(
          location.pathname,
          location.search,
        );

      if (
        !next?.promoterReference ||
        !next.scopeType
      ) {
        return;
      }

      saveAffiliate(
        next,
      );

      setAffiliate(
        next,
      );
    },
    [
      location.pathname,
      location.search,
    ],
  );

  const value =
    useMemo<
      AffiliateContextValue
    >(
      () => ({
        ...affiliate,

        clearAffiliate:
          () => {
            clearStoredAffiliate();

            setAffiliate(
              EMPTY_AFFILIATE,
            );
          },
      }),
      [
        affiliate,
      ],
    );

  return (
    <AffiliateContextStore.Provider
      value={
        value
      }
    >
      {
        children
      }
    </AffiliateContextStore.Provider>
  );
}

export function useAffiliate() {
  const value =
    useContext(
      AffiliateContextStore,
    );

  if (
    !value
  ) {
    throw new Error(
      "useAffiliate doit être utilisé dans AffiliateProvider.",
    );
  }

  return value;
}
