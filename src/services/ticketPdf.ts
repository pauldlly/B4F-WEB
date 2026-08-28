import { jsPDF } from "jspdf";
import QRCode from "qrcode";

import { formatEventDate, formatMoney } from "../lib/format";
import type { GuestOrder, GuestTicket } from "../types";

function safeFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function groupTickets(tickets: GuestTicket[]) {
  const groups = new Map<string, GuestTicket[]>();

  tickets.forEach((ticket) => {
    const key = `${ticket.eventId}:${ticket.eventDate || ""}:${ticket.startTime || ""}`;
    groups.set(key, [...(groups.get(key) ?? []), ticket]);
  });

  return Array.from(groups.values()).sort((a, b) =>
    String(a[0]?.eventDate || "").localeCompare(String(b[0]?.eventDate || "")),
  );
}

function drawPageBackground(pdf: jsPDF) {
  pdf.setFillColor(9, 9, 9);
  pdf.rect(0, 0, 210, 297, "F");
  pdf.setFillColor(251, 146, 60);
  pdf.rect(0, 0, 7, 297, "F");
  pdf.setFillColor(255, 105, 180);
  pdf.circle(194, 16, 24, "F");
}

function drawHeader(pdf: jsPDF, order: GuestOrder, title: string, subtitle: string) {
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(21);
  pdf.text("B4F EVENTS", 18, 22);

  pdf.setFontSize(8);
  pdf.setTextColor(180, 180, 180);
  pdf.text(order.reference, 18, 29);

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  const titleLines = pdf.splitTextToSize(title.toUpperCase(), 150);
  pdf.text(titleLines, 18, 46);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(170, 170, 170);
  pdf.text(subtitle, 18, 46 + titleLines.length * 7 + 4);
}

async function drawTicketCard(
  pdf: jsPDF,
  ticket: GuestTicket,
  position: { x: number; y: number; width: number; height: number },
  index: number,
  total: number,
) {
  const { x, y, width, height } = position;
  const qrDataUrl = await QRCode.toDataURL(ticket.qrCode, {
    width: 700,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#111111", light: "#ffffff" },
  });

  pdf.setFillColor(22, 22, 22);
  pdf.setDrawColor(55, 55, 55);
  pdf.roundedRect(x, y, width, height, 6, 6, "FD");

  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(x + 7, y + 8, 62, 62, 4, 4, "F");
  pdf.addImage(qrDataUrl, "PNG", x + 12, y + 13, 52, 52);

  pdf.setTextColor(251, 146, 60);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.text(`${index}/${total}`, x + width - 9, y + 13, { align: "right" });

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(12);
  pdf.text(ticket.holderName || "Client B4F", x + 77, y + 18);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(175, 175, 175);
  pdf.text(ticket.gender === "woman" ? "Tarif femme" : "Tarif homme", x + 77, y + 26);
  pdf.text(ticket.source === "pack" ? "Billet issu d’un pack" : "Billet événement", x + 77, y + 33);

  let cursor = y + 44;
  const optionNames = Array.from(new Set(ticket.optionNames ?? []));
  const tableNames = Array.from(new Set(ticket.tableNames ?? []));

  if (optionNames.length > 0) {
    pdf.setTextColor(255, 190, 230);
    pdf.setFont("helvetica", "bold");
    pdf.text("OPTIONS", x + 77, cursor);
    cursor += 5;
    pdf.setTextColor(190, 190, 190);
    pdf.setFont("helvetica", "normal");
    for (const name of optionNames.slice(0, 3)) {
      pdf.text(`• ${name}`, x + 77, cursor);
      cursor += 5;
    }
  }

  if (tableNames.length > 0 && cursor < y + height - 10) {
    pdf.setTextColor(255, 200, 120);
    pdf.setFont("helvetica", "bold");
    pdf.text("TABLE", x + 77, cursor);
    cursor += 5;
    pdf.setTextColor(190, 190, 190);
    pdf.setFont("helvetica", "normal");
    for (const name of tableNames.slice(0, 2)) {
      pdf.text(`• ${name}`, x + 77, cursor);
      cursor += 5;
    }
  }

  pdf.setTextColor(120, 120, 120);
  pdf.setFontSize(6.8);
  pdf.text(ticket.id, x + 7, y + height - 6);
}

export async function downloadOrderTicketsPdf(
  order: GuestOrder,
  locale = "fr-FR",
) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const groups = groupTickets(order.tickets);
  let pageCreated = false;
  let globalTicketIndex = 0;

  for (const group of groups) {
    const event = group[0];
    const pages = Math.ceil(group.length / 2);

    for (let pageIndex = 0; pageIndex < pages; pageIndex += 1) {
      if (pageCreated) pdf.addPage();
      pageCreated = true;
      drawPageBackground(pdf);

      drawHeader(
        pdf,
        order,
        event.eventName,
        `${formatEventDate(event.eventDate, event.startTime, {
          locale,
          includeYear: true,
        })} · ${event.location || "Barcelona"}`,
      );

      const ticketsOnPage = group.slice(pageIndex * 2, pageIndex * 2 + 2);
      for (let index = 0; index < ticketsOnPage.length; index += 1) {
        globalTicketIndex += 1;
        await drawTicketCard(
          pdf,
          ticketsOnPage[index],
          {
            x: 18,
            y: 78 + index * 91,
            width: 178,
            height: 81,
          },
          globalTicketIndex,
          order.tickets.length,
        );
      }

      pdf.setTextColor(130, 130, 130);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.text(
        `Présentez le QR code à l’entrée · Commande ${order.reference}`,
        105,
        282,
        { align: "center" },
      );
      pdf.text(
        `Total payé : ${formatMoney(order.total, locale)}`,
        105,
        288,
        { align: "center" },
      );
    }
  }

  if (order.benefits?.length > 0) {
    pdf.addPage();
    drawPageBackground(pdf);
    drawHeader(
      pdf,
      order,
      "Avantages partenaires",
      "Présentez un billet B4F valide pour profiter des offres.",
    );

    let y = 82;
    for (const benefit of order.benefits.slice(0, 5)) {
      pdf.setFillColor(22, 22, 22);
      pdf.setDrawColor(55, 55, 55);
      pdf.roundedRect(18, y, 178, 34, 5, 5, "FD");

      pdf.setFillColor(255, 105, 180);
      pdf.roundedRect(157, y + 7, 30, 12, 6, 6, "F");
      pdf.setTextColor(9, 9, 9);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.text(benefit.discountLabel, 172, y + 15, { align: "center" });

      pdf.setTextColor(251, 146, 60);
      pdf.setFontSize(8);
      pdf.text(benefit.partnerName.toUpperCase(), 26, y + 11);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.text(benefit.title, 26, y + 20);
      pdf.setTextColor(155, 155, 155);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      const instruction = pdf.splitTextToSize(
        benefit.redemptionInstructions,
        124,
      );
      pdf.text(instruction.slice(0, 2), 26, y + 27);
      y += 42;
    }

    pdf.setTextColor(125, 125, 125);
    pdf.setFontSize(8);
    pdf.text(
      "Les conditions, disponibilités et périodes de validité sont celles indiquées par chaque partenaire.",
      105,
      284,
      { align: "center", maxWidth: 175 },
    );
  }

  pdf.save(`${safeFileName(order.reference)}-billets-B4F.pdf`);
}
