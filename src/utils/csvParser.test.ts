import { describe, expect, it } from "vitest";
import { commitCSVPreview, previewCSV } from "./csvParser";
import { getPayslips } from "./storage";
import { DEFAULT_PAYROLL_RULES } from "./settings";

function csvFile(contents: string): File {
  return new File([contents], "employees.csv", { type: "text/csv" });
}

describe("csvParser", () => {
  it("parses quoted CSV fields and previews rows before saving", async () => {
    const preview = await previewCSV(csvFile(
      "\uFEFFName,Basic,HRA,Conveyance,PAN,Department\n\"Rao, Asha\",30000,10000,2000,ABCDE1234F,\"People, Ops\""
    ), DEFAULT_PAYROLL_RULES);

    expect(preview.errors).toEqual([]);
    expect(preview.rows).toHaveLength(1);
    expect(preview.rows[0].employee.name).toBe("Rao, Asha");
    expect(preview.rows[0].employee.department).toBe("People, Ops");
    expect(await getPayslips()).toEqual([]);

    await commitCSVPreview(preview, 10);
    expect(await getPayslips()).toHaveLength(1);
  });

  it("reports row-level validation errors", async () => {
    const preview = await previewCSV(csvFile(
      "Name,Basic,HRA,Conveyance,PAN,Department\n,-1,100,abc,,Ops"
    ), DEFAULT_PAYROLL_RULES);

    expect(preview.rows).toHaveLength(0);
    expect(preview.errors.map((error) => error.message)).toEqual([
      "Name is required.",
      "Basic must be a non-negative number.",
      "Conveyance must be a non-negative number.",
    ]);
  });
});
