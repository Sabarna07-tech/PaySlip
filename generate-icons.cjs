const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="24" ry="24" fill="#5B5BD6"/>
  <text
    x="64" y="96"
    text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-weight="bold"
    font-size="90"
    fill="white"
  >₹</text>
</svg>`;

const SIZES = [16, 48, 128];
const OUT_DIR = path.join(__dirname, "icons");

async function main() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const svgBuffer = Buffer.from(SVG);

  for (const size of SIZES) {
    const outPath = path.join(OUT_DIR, `icon-${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outPath);
    console.log(`✓ ${outPath}`);
  }

  console.log("\nAll icons generated.");
}

main().catch((err) => {
  console.error("Icon generation failed:", err);
  process.exit(1);
});
