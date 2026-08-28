import {
  useEffect,
  useRef
} from "react";

export function useLoadMoreObserver({
  enabled,
  loading,
  onLoadMore
}: {
  enabled: boolean;
  loading: boolean;
  onLoadMore: () => void;
}) {
  const ref = useRef<HTMLDivElement | null>(
    null
  );

  useEffect(() => {
    const node = ref.current;

    if (!node || !enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (
          entry?.isIntersecting &&
          !loading
        ) {
          onLoadMore();
        }
      },
      {
        rootMargin: "350px 0px"
      }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [enabled, loading, onLoadMore]);

  return ref;
}
