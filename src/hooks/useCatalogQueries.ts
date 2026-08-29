import {
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";

import {
  getEventDetail,
  getEventsPage,
  getPackDetail,
  getPacksPage,
} from "../services/catalog";

import {
  hasStoredAffiliateAccess,
} from "../lib/affiliate";

import type {
  CatalogFilters,
  PaginatedResult,
  PublicEvent,
  PublicPack,
} from "../types";

export const catalogKeys = {
  events: (filters: CatalogFilters) => [
    "public-events",
    filters,
  ],

  event: (
    eventId: number,
    allowAppOnly = false,
  ) => [
    "public-event",
    eventId,
    allowAppOnly
      ? "affiliate"
      : "public",
  ],

  packs: (filters: CatalogFilters) => [
    "public-packs",
    filters,
  ],

  pack: (
    packId: string,
    allowAppOnly = false,
  ) => [
    "public-pack",
    packId,
    allowAppOnly
      ? "affiliate"
      : "public",
  ],
};

export function useEventsInfinite(
  filters: CatalogFilters,
  enabled = true,
) {
  return useInfiniteQuery({
    queryKey:
      catalogKeys.events(
        filters,
      ),

    queryFn: ({
      pageParam,
    }: {
      pageParam: number;
    }) =>
      getEventsPage({
        offset:
          pageParam,

        filters,
      }),

    initialPageParam:
      0,

    getNextPageParam: (
      page: PaginatedResult<PublicEvent>,
    ) =>
      page.nextOffset ??
      undefined,

    enabled,

    /*
     * Les changements faits dans Supabase
     * (dont is_visible_only_in_app)
     * doivent être relus au rechargement.
     */
    staleTime:
      0,

    gcTime:
      10 * 60_000,

    refetchOnMount:
      "always",

    refetchOnReconnect:
      true,

    refetchOnWindowFocus:
      true,
  });
}

export function usePacksInfinite(
  filters: CatalogFilters,
  enabled = true,
) {
  return useInfiniteQuery({
    queryKey:
      catalogKeys.packs(
        filters,
      ),

    queryFn: ({
      pageParam,
    }: {
      pageParam: number;
    }) =>
      getPacksPage({
        offset:
          pageParam,

        filters,
      }),

    initialPageParam:
      0,

    getNextPageParam: (
      page: PaginatedResult<PublicPack>,
    ) =>
      page.nextOffset ??
      undefined,

    enabled,

    staleTime:
      0,

    gcTime:
      10 * 60_000,

    refetchOnMount:
      "always",

    refetchOnReconnect:
      true,

    refetchOnWindowFocus:
      true,
  });
}


export function useEventDetail(
  eventId: number,
  allowAppOnly = false,
) {
  const effectiveAllowAppOnly =
    allowAppOnly ||
    hasStoredAffiliateAccess(
      "event",
      String(
        eventId,
      ),
    );

  return useQuery({
    queryKey:
      catalogKeys.event(
        eventId,
        effectiveAllowAppOnly,
      ),

    queryFn: () =>
      getEventDetail(
        eventId,
        effectiveAllowAppOnly,
      ),

    enabled:
      Number.isFinite(
        eventId,
      ) &&
      eventId >
        0,

    staleTime:
      0,

    gcTime:
      10 * 60_000,

    refetchOnMount:
      "always",

    refetchOnReconnect:
      true,

    refetchOnWindowFocus:
      true,
  });
}

export function usePackDetail(
  packId: string,
  allowAppOnly = false,
) {
  const effectiveAllowAppOnly =
    allowAppOnly ||
    hasStoredAffiliateAccess(
      "pack",
      packId,
    );

  return useQuery({
    queryKey:
      catalogKeys.pack(
        packId,
        effectiveAllowAppOnly,
      ),

    queryFn: () =>
      getPackDetail(
        packId,
        effectiveAllowAppOnly,
      ),

    enabled:
      packId.length >
      0,

    staleTime:
      0,

    gcTime:
      10 * 60_000,

    refetchOnMount:
      "always",

    refetchOnReconnect:
      true,

    refetchOnWindowFocus:
      true,
  });
}
