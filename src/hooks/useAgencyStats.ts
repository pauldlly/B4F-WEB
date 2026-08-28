import { useQuery } from "@tanstack/react-query";

import { getAgencyStats } from "../services/stats";

export function useAgencyStats() {
  return useQuery({
    queryKey: ["public-agency-stats"],
    queryFn: getAgencyStats,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
  });
}
