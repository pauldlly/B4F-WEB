import { LoaderCircle } from "lucide-react";

import { useLoadMoreObserver } from "../hooks/useLoadMoreObserver";
import { useI18n } from "../i18n/LanguageProvider";

export function LoadMoreTrigger({
  hasMore,
  loading,
  onLoadMore,
}: {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
}) {
  const { t } = useI18n();
  const ref = useLoadMoreObserver({
    enabled: hasMore,
    loading,
    onLoadMore,
  });

  if (!hasMore) {
    return (
      <div className="py-10 text-center font-subtext text-xs uppercase tracking-[0.15em] text-white/20">
        {t("common.allLoaded")}
      </div>
    );
  }

  return (
    <div ref={ref} className="flex flex-col items-center py-10">
      {loading ? (
        <div className="flex items-center gap-3 font-body text-sm text-white/40">
          <LoaderCircle size={20} className="animate-spin text-secondary" />
          {t("common.loading")}
        </div>
      ) : (
        <button type="button" onClick={onLoadMore} className="secondary-button">
          {t("common.loadMore")}
        </button>
      )}
    </div>
  );
}
