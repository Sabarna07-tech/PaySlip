const fs = require("node:fs");
const path = require("node:path");

fs.rmSync(path.resolve(__dirname, "..", "dist"), { recursive: true, force: true });
fs.rmSync(path.resolve(__dirname, "..", "payslip-v1.0.0.zip"), { force: true });
