import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Navigate,
  useParams,
} from "react-router-dom";

import {
  affiliateFromUrl,
  saveAffiliate,
} from "../lib/affiliate";

export function AffiliatePage() {
  const {
    affiliate,
  } =
    useParams<{
      affiliate?: string;
    }>();

  const [
    ready,
    setReady,
  ] =
    useState(
      false,
    );

  const target =
    useMemo(
      () =>
        affiliateFromUrl(
          `/${affiliate ?? ""}`,
          "",
        ),
      [
        affiliate,
      ],
    );

  /*
   * On enregistre AVANT de rediriger.
   * Ainsi l'affiliation est déjà présente
   * quand EventPage / PackPage se charge.
   */
  useEffect(
    () => {
      if (
        target?.promoterReference &&
        target.scopeType
      ) {
        saveAffiliate(
          target,
        );
      }

      setReady(
        true,
      );
    },
    [
      target,
    ],
  );

  if (
    !ready
  ) {
    return null;
  }

  if (
    !target ||
    !target.promoterReference ||
    !target.scopeType
  ) {
    return (
      <Navigate
        to="/events"
        replace
      />
    );
  }

  /*
   * LIEN GÉNÉRIQUE :
   * /paul-dailly
   *
   * Le client arrive sur l'accueil puis
   * navigue où il veut.
   */
  if (
    target.scopeType ===
    "general"
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  /*
   * EVENT :
   * /paul-dailly:66
   */
  if (
    target.scopeType ===
    "event"
  ) {
    return (
      <Navigate
        to={`/event/${encodeURIComponent(
          target.scopeId ??
            "",
        )}`}
        replace
      />
    );
  }

  /*
   * PACK :
   * /paul-dailly:UUID
   */
  return (
    <Navigate
      to={`/pack/${encodeURIComponent(
        target.scopeId ??
          "",
      )}`}
      replace
    />
  );
}
