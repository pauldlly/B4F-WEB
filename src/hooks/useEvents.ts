import { useCallback, useEffect, useState } from "react";

import { getPublicEvents } from "../services/events";
import type { PublicEvent } from "../types";

type State = {
  events: PublicEvent[];
  source: "supabase" | "demo";
  loading: boolean;
  error: string | null;
};

export function useEvents() {
  const [state, setState] = useState<State>({
    events: [],
    source: "demo",
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    try {
      setState((current) => ({
        ...current,
        loading: true,
        error: null,
      }));

      const result = await getPublicEvents();

      setState({
        events: result.events,
        source: result.source,
        loading: false,
        error: null,
      });
    } catch (error: unknown) {
      setState({
        events: [],
        source: "demo",
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Impossible de charger les événements.",
      });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    ...state,
    reload: load,
  };
}
