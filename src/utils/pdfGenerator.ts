import { jsPDF } from "jspdf";
import type { Payslip } from "@/types";
import { formatINRPlain } from "@/utils/payroll";
import { getSettings, type AppSettings } from "@/utils/settings";
import { isPro } from "@/utils/license";
import type { PdfThemeId } from "@/config";

const MARGIN = 20;
const PAGE_WIDTH = 210; // A4 width in mm
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const COL_WIDTH = CONTENT_WIDTH / 2;
const LINE_HEIGHT = 7;

type RGB = [number, number, number];

interface ThemeTokens {
  accent: RGB; // header bars + net-pay footer
  infoBg: RGB; // employee info box
  rowBg: RGB; // alternating row shading
}

const THEME_TOKENS: Record<PdfThemeId, ThemeTokens> = {
  classic: { accent: [91, 91, 214], infoBg: [245, 245, 244], rowBg: [248, 248, 247] },
  monochrome: { accent: [39, 39, 42], infoBg: [244, 244, 245], rowBg: [250, 250, 250] },
  emerald: { accent: [16, 122, 87], infoBg: [240, 247, 244], rowBg: [247, 251, 249] },
};

export interface RenderOptions {
  themeId: PdfThemeId;
  allowLogo: boolean;
}

export function payslipFilename(p: Payslip): string {
  const safeName = (p.employee.name || "employee").replace(/[^a-z0-9]+/gi, "_").toLowerCase();
  const safeMonth = (p.employee.month || "").replace(/\s+/g, "_").toLowerCase();
  return `payslip_${safeName}_${safeMonth}_${p.employee.year}.pdf`;
}

/**
 * Resolves which render features the current user is entitled to. Premium PDF
 * themes and the company logo require PaySlip Pro; everyone else gets the clean
 * classic layout.
 */
export async function resolveRenderOptions(settings: AppSettings): Promise<RenderOptions> {
  const pro = await isPro();
  const wantsPremiumTheme = settings.pdfTheme && settings.pdfTheme !== "classic";
  return {
    themeId: pro && wantsPremiumTheme ? settings.pdfTheme : "classic",
    allowLogo: pro,
  };
}

/**
 * Builds (but does not save) an A4 portrait payslip document. Returning the
 * jsPDF instance lets callers either trigger a download or collect many docs
 * into a single ZIP for bulk export.
 */
export function buildPayslipDoc(p: Payslip, settings: AppSettings, opts: RenderOptions): jsPDF {
  const theme = THEME_TOKENS[opts.themeId] ?? THEME_TOKENS.classic;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  let y = MARGIN;

  // ── Header ──────────────────────────────────────────────
  const showLogo = opts.allowLogo && !!settings.companyLogoBase64;
  if (showLogo) {
    doc.addImage(settings.companyLogoBase64!, MARGIN, y, 20, 20);

    const headerX = MARGIN + 25;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(settings.companyName || "Your Company Name", headerX, y + 8, { align: "left" });

    if (settings.companyAddress) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(settings.companyAddress, headerX, y + 14, { align: "left" });
    }
    y += 28;
  } else {
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
  }

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("SALARY SLIP", PAGE_WIDTH / 2, y, { align: "center" });
  y += 7;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`${p.employee.month} ${p.employee.year}`, PAGE_WIDTH / 2, y, { align: "center" });
  y += 10;

  // ── Employee Info Box ───────────────────────────────────
  doc.setFillColor(...theme.infoBg);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 34, 2, 2, "F");

  doc.setFontSize(9);

  doc.setFont("helvetica", "bold");
  doc.text("Employee:", MARGIN + 4, y + 7);
  doc.text("Designation:", MARGIN + 4, y + 14);
  doc.text("Department:", MARGIN + 4, y + 21);
  doc.text("Bank A/C:", MARGIN + 4, y + 28);

  doc.setFont("helvetica", "normal");
  doc.text(p.employee.name || "-", MARGIN + 28, y + 7);
  doc.text(p.employee.designation || "-", MARGIN + 28, y + 14);
  doc.text(p.employee.department || "-", MARGIN + 28, y + 21);
  doc.text(p.employee.bankAccount || "-", MARGIN + 28, y + 28);

  const rightColX = MARGIN + CONTENT_WIDTH / 2;
  doc.setFont("helvetica", "bold");
  doc.text("Period:", rightColX, y + 7);
  doc.text("PAN:", rightColX, y + 14);
  doc.text("UAN:", rightColX, y + 21);

  doc.setFont("helvetica", "normal");
  doc.text(`${p.employee.month} ${p.employee.year}`, rightColX + 16, y + 7);
  doc.text(p.employee.pan || "-", rightColX + 16, y + 14);
  doc.text(p.employee.uan || "-", rightColX + 16, y + 21);

  y += 40;

  // ── Column Headers ──────────────────────────────────────
  doc.setFillColor(...theme.accent);
  doc.rect(MARGIN, y, COL_WIDTH, LINE_HEIGHT, "F");
  doc.rect(MARGIN + COL_WIDTH, y, COL_WIDTH, LINE_HEIGHT, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Earnings", MARGIN + 4, y + 5);
  doc.text("Deductions", MARGIN + COL_WIDTH + 4, y + 5);
  doc.setTextColor(0, 0, 0);
  y += LINE_HEIGHT + 2;

  const earningsItems: [string, number][] = [
    ["Basic Salary", p.earnings.basic],
    ["HRA", p.earnings.hra],
    ["Conveyance", p.earnings.conveyance],
    ["Medical", p.earnings.medical],
    ["Special Allowance", p.earnings.special],
    ["LTA", p.earnings.lta || 0],
    ...(p.employee.customAllowances || []).map((ca) => [ca.name, ca.amount] as [string, number]),
    ["Overtime Pay", p.earnings.overtimePay],
    ["Bonus", p.earnings.bonus],
  ];

  const deductionItems: [string, number][] = [
    ["Provident Fund", p.deductions.pf],
    ["ESI", p.deductions.esi],
    ["TDS", p.deductions.tds],
    ["Professional Tax", p.deductions.pt],
    ["Unpaid Leave", p.deductions.unpaidLeaveDeduction],
  ];

  const maxRows = Math.max(earningsItems.length, deductionItems.length);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  for (let i = 0; i < maxRows; i++) {
    if (i % 2 === 0) {
      doc.setFillColor(...theme.rowBg);
      doc.rect(MARGIN, y, CONTENT_WIDTH, LINE_HEIGHT, "F");
    }

    if (i < earningsItems.length) {
      const [label, amount] = earningsItems[i];
      doc.text(label, MARGIN + 4, y + 5);
      doc.text(formatINRPlain(amount), MARGIN + COL_WIDTH - 4, y + 5, { align: "right" });
    }

    if (i < deductionItems.length) {
      const [label, amount] = deductionItems[i];
      doc.text(label, MARGIN + COL_WIDTH + 4, y + 5);
      doc.text(formatINRPlain(amount), MARGIN + CONTENT_WIDTH - 4, y + 5, { align: "right" });
    }

    y += LINE_HEIGHT;
  }

  y += 4;

  // ── Totals row ──────────────────────────────────────────
  doc.setDrawColor(228, 227, 223);
  doc.line(MARGIN, y, MARGIN + CONTENT_WIDTH, y);
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);

  doc.text("Gross Earnings", MARGIN + 4, y);
  doc.text(formatINRPlain(p.earnings.total), MARGIN + COL_WIDTH - 4, y, { align: "right" });

  doc.text("Total Deductions", MARGIN + COL_WIDTH + 4, y);
  doc.text(formatINRPlain(p.deductions.total), MARGIN + CONTENT_WIDTH - 4, y, { align: "right" });
  y += 12;

  // ── Net Pay Footer ──────────────────────────────────────
  doc.setFillColor(...theme.accent);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 14, 2, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("NET PAY", MARGIN + 4, y + 9);
  doc.text(formatINRPlain(p.netPay), MARGIN + CONTENT_WIDTH - 4, y + 9, { align: "right" });
  doc.setTextColor(0, 0, 0);

  return doc;
}

/**
 * Generates and triggers download of a single payslip PDF.
 */
export async function generatePayslipPDF(p: Payslip): Promise<void> {
  const settings = await getSettings();
  const opts = await resolveRenderOptions(settings);
  const doc = buildPayslipDoc(p, settings, opts);
  doc.save(payslipFilename(p));
}
