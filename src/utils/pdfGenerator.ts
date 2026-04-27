import { jsPDF } from "jspdf";
import type { Payslip } from "@/types";
import { formatINR } from "@/utils/payroll";
import { getSettings } from "@/utils/settings";

const MARGIN = 20;
const PAGE_WIDTH = 210; // A4 width in mm
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const COL_WIDTH = CONTENT_WIDTH / 2;
const LINE_HEIGHT = 7;

/**
 * Generates and triggers download of an A4 portrait PDF payslip.
 */
export async function generatePayslipPDF(p: Payslip): Promise<void> {
  const settings = await getSettings();
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  let y = MARGIN;

  // ── Header ──────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(settings.companyName || "Your Company Name", PAGE_WIDTH / 2, y, { align: "center" });
  y += 8;

  if (settings.companyAddress) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(settings.companyAddress, PAGE_WIDTH / 2, y, { align: "center" });
    y += 6;
  }

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("SALARY SLIP", PAGE_WIDTH / 2, y, { align: "center" });
  y += 7;

  doc.setFontSize(10);
  doc.text(
    `${p.employee.month} ${p.employee.year}`,
    PAGE_WIDTH / 2,
    y,
    { align: "center" }
  );
  y += 10;

  // ── Employee Info Box ───────────────────────────────────
  doc.setFillColor(245, 245, 244); // light gray
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 18, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Employee:", MARGIN + 4, y + 7);
  doc.setFont("helvetica", "normal");
  doc.text(p.employee.name, MARGIN + 30, y + 7);

  doc.setFont("helvetica", "bold");
  doc.text("Period:", MARGIN + 4, y + 13);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${p.employee.month} ${p.employee.year}`,
    MARGIN + 30,
    y + 13
  );
  y += 24;

  // ── Column Headers ──────────────────────────────────────
  doc.setFillColor(91, 91, 214); // primary #5B5BD6
  doc.rect(MARGIN, y, COL_WIDTH, LINE_HEIGHT, "F");
  doc.rect(MARGIN + COL_WIDTH, y, COL_WIDTH, LINE_HEIGHT, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Earnings", MARGIN + 4, y + 5);
  doc.text("Deductions", MARGIN + COL_WIDTH + 4, y + 5);
  doc.setTextColor(0, 0, 0);
  y += LINE_HEIGHT + 2;

  // ── Earnings rows ───────────────────────────────────────
  const earningsItems: [string, number][] = [
    ["Basic Salary", p.earnings.basic],
    ["HRA", p.earnings.hra],
    ["Conveyance", p.earnings.conveyance],
    ["Medical", p.earnings.medical],
    ["Special Allowance", p.earnings.special],
    ["Overtime Pay", p.earnings.overtimePay],
    ["Bonus", p.earnings.bonus],
  ];

  // ── Deductions rows ─────────────────────────────────────
  const deductionItems: [string, number][] = [
    ["Provident Fund", p.deductions.pf],
    ["ESI", p.deductions.esi],
    ["TDS", p.deductions.tds],
    ["Unpaid Leave", p.deductions.unpaidLeaveDeduction],
  ];

  const maxRows = Math.max(earningsItems.length, deductionItems.length);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  for (let i = 0; i < maxRows; i++) {
    // Alternate row shading
    if (i % 2 === 0) {
      doc.setFillColor(248, 248, 247); // surface
      doc.rect(MARGIN, y, CONTENT_WIDTH, LINE_HEIGHT, "F");
    }

    // Earnings column
    if (i < earningsItems.length) {
      const [label, amount] = earningsItems[i];
      doc.text(label, MARGIN + 4, y + 5);
      doc.text(formatINR(amount), MARGIN + COL_WIDTH - 4, y + 5, {
        align: "right",
      });
    }

    // Deductions column
    if (i < deductionItems.length) {
      const [label, amount] = deductionItems[i];
      doc.text(label, MARGIN + COL_WIDTH + 4, y + 5);
      doc.text(formatINR(amount), MARGIN + CONTENT_WIDTH - 4, y + 5, {
        align: "right",
      });
    }

    y += LINE_HEIGHT;
  }

  y += 4;

  // ── Totals row ──────────────────────────────────────────
  doc.setDrawColor(228, 227, 223); // border color
  doc.line(MARGIN, y, MARGIN + CONTENT_WIDTH, y);
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);

  // Gross Earnings total
  doc.text("Gross Earnings", MARGIN + 4, y);
  doc.text(formatINR(p.earnings.total), MARGIN + COL_WIDTH - 4, y, {
    align: "right",
  });

  // Total Deductions total
  doc.text("Total Deductions", MARGIN + COL_WIDTH + 4, y);
  doc.text(formatINR(p.deductions.total), MARGIN + CONTENT_WIDTH - 4, y, {
    align: "right",
  });
  y += 12;

  // ── Net Pay Footer ──────────────────────────────────────
  doc.setFillColor(91, 91, 214); // primary
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 14, 2, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("NET PAY", MARGIN + 4, y + 9);
  doc.text(formatINR(p.netPay), MARGIN + CONTENT_WIDTH - 4, y + 9, {
    align: "right",
  });
  doc.setTextColor(0, 0, 0);

  // ── Save ────────────────────────────────────────────────
  const safeName = p.employee.name.replace(/\s+/g, "_").toLowerCase();
  const safeMonth = p.employee.month.replace(/\s+/g, "_").toLowerCase();
  const filename = `payslip_${safeName}_${safeMonth}_${p.employee.year}.pdf`;
  doc.save(filename);
}
