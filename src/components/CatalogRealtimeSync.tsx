import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { supabase } from "../lib/supabase";

const TABLES = [
  "Event",
  "EventOption",
  "EventTable",
  "Pack",
  "PackEvent",
  "PackEventOption",
  "PackEventTable",
] as const;

export function CatalogRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const client = supabase;

    if (!client) return;

    let timer: number | null = null;

    const refreshCatalog = () => {
      if (timer) {
        window.clearTimeout(timer);
      }

      timer = window.setTimeout(() => {
        void queryClient.invalidateQueries({
          queryKey: ["public-events"],
        });

        void queryClient.invalidateQueries({
          queryKey: ["public-event"],
        });

        void queryClient.invalidateQueries({
          queryKey: ["public-packs"],
        });

        void queryClient.invalidateQueries({
          queryKey: ["public-pack"],
        });
      }, 180);
    };

    const channel = client.channel(
      "public-ticketing-catalog-live-v10",
    );

    TABLES.forEach((table) => {
      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
        },
        refreshCatalog,
      );
    });

    channel.subscribe((status) => {
      if (
        ["CHANNEL_ERROR", "TIMED_OUT", "CLOSED"].includes(
          status,
        )
      ) {
        refreshCatalog();
      }
    });

    return () => {
      if (timer) {
        window.clearTimeout(timer);
      }

      void client.removeChannel(channel);
    };
  }, [queryClient]);

  return null;
}