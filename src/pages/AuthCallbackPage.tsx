import { CheckCircle2, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Seo } from "../components/Seo";
import { useI18n } from "../i18n/LanguageProvider";
import { supabase } from "../lib/supabase";

export function AuthCallbackPage() {
  const [ready, setReady] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }

    void supabase.auth.getSession().finally(() => setReady(true));
  }, []);

  return (
    <div className="page-shell grid min-h-[75vh] place-items-center pb-20 pt-36 text-center">
      <Seo title={t("nav.login")} description={t("auth.description")} noIndex />

      <div className="surface-card max-w-lg p-10">
        {ready ? (
          <CheckCircle2 className="mx-auto text-success" size={44} />
        ) : (
          <LoaderCircle className="mx-auto animate-spin text-secondary" size={44} />
        )}

        <h1 className="mt-5 font-title text-2xl uppercase">
          {ready ? t("nav.account") : t("common.loading")}
        </h1>
        <p className="mt-3 font-body text-white/40">
          {ready ? t("checkout.accountLinked") : t("common.loading")}
        </p>

        {ready && (
          <Link to="/compte" className="primary-button mt-6">
            {t("nav.account")}
          </Link>
        )}
      </div>
    </div>
  );
}
