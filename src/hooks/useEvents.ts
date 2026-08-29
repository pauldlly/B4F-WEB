import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getEventsPage,
} from "../services/events";

import type {
  CatalogFilters,
  PublicEvent,
} from "../types";

type State = {
  events: PublicEvent[];
  source:
    | "supabase"
    | "demo";
  loading: boolean;
  error: string | null;
};

/* =========================================================
   FILTRES PAR DÉFAUT
========================================================= */

const defaultFilters: CatalogFilters = {
  search: "",
  eventTypes: [],
  datePreset: "all",
  startDate: "",
  endDate: "",
};

/* =========================================================
   UNIQUE EVENTS
========================================================= */

function uniqueEvents(
  events: PublicEvent[],
) {
  return Array.from(
    new Map(
      events.map(
        (
          event,
        ) => [
          event.id,
          event,
        ],
      ),
    ).values(),
  );
}

/* =========================================================
   USE EVENTS
========================================================= */

export function useEvents() {
  const [
    state,
    setState,
  ] =
    useState<State>({
      events: [],
      source: "demo",
      loading: true,
      error: null,
    });

  /* =====================================================
     LOAD
  ===================================================== */

  const load =
    useCallback(
      async () => {
        try {
          setState(
            (
              current,
            ) => ({
              ...current,

              loading:
                true,

              error:
                null,
            }),
          );

          /*
           * Le nouveau service fonctionne
           * avec une pagination.
           *
           * Ici on récupère donc toutes
           * les pages pour garder le même
           * comportement que l'ancien
           * getPublicEvents().
           */
          const allEvents:
            PublicEvent[] =
            [];

          let offset =
            0;

          let source:
            | "supabase"
            | "demo" =
            "demo";

          const visitedOffsets =
            new Set<number>();

          while (
            !visitedOffsets.has(
              offset,
            )
          ) {
            visitedOffsets.add(
              offset,
            );

            const result =
              await getEventsPage({
                offset,

                filters:
                  defaultFilters,
              });

            source =
              result.source;

            allEvents.push(
              ...result.items,
            );

            if (
              result.nextOffset ===
              null
            ) {
              break;
            }

            offset =
              result.nextOffset;
          }

          /*
           * Sécurité contre les doublons.
           */
          const events =
            uniqueEvents(
              allEvents,
            );

          setState({
            events,

            source,

            loading:
              false,

            error:
              null,
          });
        } catch (
          error: unknown
        ) {
          setState({
            events: [],

            source:
              "demo",

            loading:
              false,

            error:
              error instanceof
              Error
                ? error.message
                : "Impossible de charger les événements.",
          });
        }
      },
      [],
    );

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(
    () => {
      void load();
    },
    [
      load,
    ],
  );

  /* =====================================================
     RETURN
  ===================================================== */

  return {
    ...state,

    reload:
      load,
  };
}