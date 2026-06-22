const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const { version } = require(path.join(root, "package.json"));
const zipName = `payslip-v${version}.zip`;
const zipPath = path.join(root, zipName);

if (!fs.existsSync(dist)) {
  throw new Error("dist folder not found. Run npm run build first.");
}

fs.rmSync(zipPath, { force: true });

execFileSync(
  "powershell",
  [
    "-NoProfile",
    "-Command",
    `Compress-Archive -Path .\\dist\\* -DestinationPath .\\${zipName} -Force`,
  ],
  { cwd: root, stdio: "inherit" }
);

console.log(`✓ Created ${zipName}`);
