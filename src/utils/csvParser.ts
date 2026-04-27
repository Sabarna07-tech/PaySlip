import { calculatePayslip } from "./payroll";
import { savePayslip } from "./storage";
import type { Employee } from "@/types";

export async function processCSV(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        
        if (lines.length <= 1) {
          return resolve(0); // No data rows
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const expectedHeaders = ['name', 'basic', 'hra', 'conveyance', 'pan', 'department'];
        
        // Basic validation
        for (const expected of expectedHeaders) {
          if (!headers.includes(expected)) {
            return reject(new Error(`Missing required column: ${expected}`));
          }
        }

        const nameIdx = headers.indexOf('name');
        const basicIdx = headers.indexOf('basic');
        const hraIdx = headers.indexOf('hra');
        const convIdx = headers.indexOf('conveyance');
        const panIdx = headers.indexOf('pan');
        const deptIdx = headers.indexOf('department');

        const now = new Date();
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        let count = 0;

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          
          if (values.length < headers.length) continue;

          const emp: Employee = {
            name: values[nameIdx],
            basicSalary: parseFloat(values[basicIdx]) || 0,
            hra: parseFloat(values[hraIdx]) || 0,
            conveyance: parseFloat(values[convIdx]) || 0,
            pan: values[panIdx],
            department: values[deptIdx],
            // Default remaining fields
            medical: 0,
            special: 0,
            pfEmployer: false,
            esiApplicable: false,
            paidLeaves: 0,
            unpaidLeaves: 0,
            overtimeHours: 0,
            overtimeRate: 0,
            bonus: 0,
            tds: 0,
            month: monthNames[now.getMonth()],
            year: now.getFullYear(),
          };

          const payslip = calculatePayslip(emp);
          await savePayslip(payslip);
          count++;
        }
        resolve(count);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
