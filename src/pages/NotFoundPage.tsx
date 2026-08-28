import { SearchX } from "lucide-react";
import { Link } from "react-router-dom";

import { Seo } from "../components/Seo";
import { useI18n } from "../i18n/LanguageProvider";

export function NotFoundPage() {
  const { t } = useI18n();

  return (
    <div className="page-shell pb-24 pt-36 text-center">
      <Seo title="404" description="B4F EVENTS" noIndex />
      <SearchX className="mx-auto text-white/20" size={48} />
      <h1 className="mt-5 font-title text-4xl uppercase">404</h1>
      <p className="mt-3 font-body text-white/40">{t("home.emptyDescription")}</p>
      <Link to="/" className="primary-button mt-6">
        {t("common.back")}
      </Link>
    </div>
  );
}
