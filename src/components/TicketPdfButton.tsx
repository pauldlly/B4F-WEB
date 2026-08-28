import { Download, LoaderCircle } from "lucide-react";
import { useState } from "react";

import { useI18n } from "../i18n/LanguageProvider";
import { downloadOrderTicketsPdf } from "../services/ticketPdf";
import type { GuestOrder } from "../types";

export function TicketPdfButton({
  order
}: {
  order: GuestOrder;
}) {
  const { locale } = useI18n();
  const [loading, setLoading] = useState(false);

  const download = async () => {
    try {
      setLoading(true);
      await downloadOrderTicketsPdf(order, locale);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void download()}
      disabled={loading}
      className="secondary-button"
    >
      {loading ? (
        <LoaderCircle
          size={18}
          className="animate-spin"
        />
      ) : (
        <Download size={18} />
      )}
      {loading
        ? "Préparation du PDF…"
        : "Télécharger en PDF"}
    </button>
  );
}
