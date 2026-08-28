import { Cookie, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "b4f-cookie-choice-v2";
const STORAGE_DATE_KEY = "b4f-cookie-choice-date-v2";
const SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000;

type CookieChoice = "necessary" | "all";

function choiceIsCurrent() {
  const choice = localStorage.getItem(STORAGE_KEY);
  const storedAt = Number(localStorage.getItem(STORAGE_DATE_KEY) || 0);
  return Boolean(choice && storedAt && Date.now() - storedAt < SIX_MONTHS_MS);
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!choiceIsCurrent());

    const open = () => setVisible(true);
    window.addEventListener("b4f-open-cookie-settings", open);
    return () => window.removeEventListener("b4f-open-cookie-settings", open);
  }, []);

  const choose = (choice: CookieChoice) => {
    localStorage.setItem(STORAGE_KEY, choice);
    localStorage.setItem(STORAGE_DATE_KEY, String(Date.now()));
    window.dispatchEvent(new CustomEvent("b4f-cookie-choice", { detail: choice }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside className="fixed inset-x-3 bottom-3 z-[120] mx-auto max-w-[760px] rounded-[24px] border border-white/10 bg-[#111]/[0.97] p-4 shadow-[0_28px_90px_rgba(0,0,0,.62)] backdrop-blur-2xl sm:p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-secondary/10 text-secondary">
          <Cookie size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-subtitle text-sm">Vos préférences de confidentialité</h2>
              <p className="mt-2 font-body text-xs leading-5 text-white/[0.45] sm:text-sm sm:leading-6">
                Les stockages nécessaires font fonctionner le panier, la langue et les billets. Les services optionnels ne sont activés qu’avec votre accord.{" "}
               </p>
            </div>
            <button
              type="button"
              onClick={() => choose("necessary")}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white/[0.35] hover:bg-white/5 hover:text-white"
              aria-label="Refuser les cookies optionnels et fermer"
            >
              <X size={17} />
            </button>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button type="button" onClick={() => choose("necessary")} className="secondary-button min-h-11 w-full px-5">
              Tout refuser
            </button>
            <button type="button" onClick={() => choose("all")} className="primary-button min-h-11 w-full px-5">
              Tout accepter
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
