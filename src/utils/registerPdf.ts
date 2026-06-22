import { jsPDF } from "jspdf";
import type { AppSettings } from "@/utils/settings";
import type { AnnualRegister } from "@/utils/reports";
import { formatINRPlain } from "@/utils/payroll";

const MARGIN = 12;
const PAGE_WIDTH = 297; // A4 landscape
const PAGE_HEIGHT = 210;

interface Column {
  label: string;
  width: number;
  align: "left" | "right";
}

const COLUMNS: Column[] = [
  { label: "Employee", width: 50, align: "left" },
  { label: "PAN", width: 32, align: "left" },
  { label: "Dept", width: 30, align: "left" },
  { label: "Mo.", width: 12, align: "right" },
  { label: "Gross", width: 33, align: "right" },
  { label: "PF", width: 24, align: "right" },
  { label: "ESI", width: 20, align: "right" },
  { label: "TDS", width: 26, align: "right" },
  { label: "Net Pay", width: 36, align: "right" },
];

/** Builds a landscape A4 salary-register PDF (one row per employee). */
export function buildRegisterDoc(register: AnnualRegister, settings: AppSettings): jsPDF {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  let y = MARGIN;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(settings.companyName || "Salary Register", MARGIN, y + 5);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Salary Register — ${register.label}`, MARGIN, y + 11);
  doc.text(
    `${register.totals.employees} employees · ${register.totals.payslips} payslips`,
    PAGE_WIDTH - MARGIN,
    y + 11,
    { align: "right" }
  );
  y += 18;

  const drawRow = (cells: string[], opts: { header?: boolean; bold?: boolean } = {}) => {
    let x = MARGIN;
    if (opts.header) {
      doc.setFillColor(91, 91, 214);
      doc.rect(MARGIN, y, PAGE_WIDTH - MARGIN * 2, 8, "F");
      doc.setTextColor(255, 255, 255);
    } else {
      doc.setTextColor(0, 0, 0);
    }
    doc.setFont("helvetica", opts.header || opts.bold ? "bold" : "normal");
    doc.setFontSize(9);
    COLUMNS.forEach((col, i) => {
      const text = cells[i] ?? "";
      const tx = col.align === "right" ? x + col.width - 2 : x + 2;
      doc.text(text, tx, y + 5.5, { align: col.align });
      x += col.width;
    });
    y += 8;
  };

  drawRow(COLUMNS.map((c) => c.label), { header: true });

  for (const r of register.rows) {
    if (y > PAGE_HEIGHT - MARGIN - 8) {
      doc.addPage();
      y = MARGIN;
      drawRow(COLUMNS.map((c) => c.label), { header: true });
    }
    drawRow([
      r.name,
      r.pan || "-",
      r.department || "-",
      String(r.months),
      formatINRPlain(r.gross),
      formatINRPlain(r.pf),
      formatINRPlain(r.esi),
      formatINRPlain(r.tds),
      formatINRPlain(r.net),
    ]);
  }

  doc.setDrawColor(200, 200, 200);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  drawRow(
    ["TOTAL", "", "", "", formatINRPlain(register.totals.gross), "", "", "", formatINRPlain(register.totals.net)],
    { bold: true }
  );

  return doc;
}
