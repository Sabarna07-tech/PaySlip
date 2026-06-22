import JSZip from "jszip";
import type { Payslip } from "@/types";
import { getSettings } from "@/utils/settings";
import { buildPayslipDoc, payslipFilename, resolveRenderOptions } from "@/utils/pdfGenerator";
import { downloadBlob } from "@/utils/download";

/**
 * Renders every payslip to a PDF and bundles them into a single ZIP download.
 * Filenames are de-duplicated so two payslips for the same name/month don't
 * collide inside the archive.
 */
export async function generatePayslipsZip(payslips: Payslip[], zipName: string): Promise<number> {
  if (payslips.length === 0) return 0;

  const settings = await getSettings();
  const opts = await resolveRenderOptions(settings);
  const zip = new JSZip();
  const used = new Set<string>();

  for (const p of payslips) {
    const doc = buildPayslipDoc(p, settings, opts);
    const blob = doc.output("blob");

    let name = payslipFilename(p);
    if (used.has(name)) {
      const base = name.replace(/\.pdf$/i, "");
      let i = 2;
      while (used.has(`${base}_${i}.pdf`)) i++;
      name = `${base}_${i}.pdf`;
    }
    used.add(name);
    zip.file(name, blob);
  }

  const content = await zip.generateAsync({ type: "blob" });
  downloadBlob(content, zipName);
  return used.size;
}
