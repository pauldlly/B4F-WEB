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

  pack: (packId: string) => [
    "public-pack",
    packId,
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
  return useQuery({
    queryKey:
      catalogKeys.event(
        eventId,
        allowAppOnly,
      ),

    queryFn: () =>
      getEventDetail(
        eventId,
        allowAppOnly,
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
) {
  return useQuery({
    queryKey:
      catalogKeys.pack(
        packId,
      ),

    queryFn: () =>
      getPackDetail(
        packId,
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
