import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import pptxgen from "pptxgenjs";

const CHROME_PATH = "/ms-playwright/chromium_headless_shell-1247/chrome-headless-shell-linux64/chrome-headless-shell";
const HTML_FILE = path.resolve("public/SafeStack_Presentation_Deck.html");
const TMP_HTML_DIR = path.resolve("/tmp/slides_html");
const SLIDES_OUTPUT_DIR = path.resolve("public/slides");
const PPTX_OUTPUT = path.resolve("public/SafeStack_Weather_Guard_Presentation.pptx");

// Ensure directories exist
fs.mkdirSync(TMP_HTML_DIR, { recursive: true });
fs.mkdirSync(SLIDES_OUTPUT_DIR, { recursive: true });

async function run() {
  console.log("Reading SafeStack_Presentation_Deck.html...");
  const rawHtml = fs.readFileSync(HTML_FILE, "utf-8");

  // Extract all <section class="slide...">...</section>
  const slideRegex = /<section\s+class="slide[^"]*"[\s\S]*?<\/section>/gi;
  const slideMatches = rawHtml.match(slideRegex);

  if (!slideMatches || slideMatches.length === 0) {
    console.error("No slides found in HTML file!");
    process.exit(1);
  }

  const totalSlides = slideMatches.length;
  console.log(`Found ${totalSlides} slides in presentation deck.`);

  const slideImages = [];

  for (let i = 0; i < totalSlides; i++) {
    const slideNum = i + 1;
    const slideContent = slideMatches[i]
      .replace(/class="slide[^"]*"/, 'class="slide-content w-full"')
      .replace(/display:\s*none;?/g, '');

    const singleSlideHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1920, height=1080, initial-scale=1.0">
  <title>SafeStack Weather Guard - Slide ${slideNum}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
    * { box-sizing: border-box; }
    html, body {
      width: 1920px;
      height: 1080px;
      overflow: hidden;
      margin: 0;
      padding: 0;
      background-color: #030712;
      color: #f3f4f6;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 flex flex-col justify-between p-10 h-screen select-none">
  <!-- Top Header Navigation -->
  <div class="flex items-center justify-between border-b border-slate-800 pb-3">
    <div class="flex items-center space-x-3">
      <div class="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-lg shadow-sm">
        <i class="fa-solid fa-shield-halved"></i>
      </div>
      <div>
        <span class="font-extrabold text-slate-100 tracking-tight text-lg">SafeStack <span class="text-amber-400 font-semibold">Weather Guard</span></span>
        <span class="ml-3 text-xs px-2.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">TECHNICAL EXECUTIVE DECK</span>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <span class="text-xs font-mono text-slate-400">Real-Time Aerodynamic Safety Intelligence</span>
      <span class="px-3.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono font-bold text-amber-400 shadow-sm">
        Slide ${slideNum} / ${totalSlides}
      </span>
    </div>
  </div>

  <!-- Main Slide Body -->
  <div class="flex-1 flex items-center justify-center py-4 px-6 overflow-hidden">
    <div class="w-full max-w-6xl">
      ${slideContent}
    </div>
  </div>

  <!-- Bottom Compliance Footer -->
  <div class="flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs text-slate-500 font-mono">
    <span>KDS Structural Wind Codes Compliant &middot; 5 Physics Failure Modes &middot; Python High-Performance Engine</span>
    <span>Dual-Locale (KO / EN 100%) &middot; Live KMA API Pipeline &middot; Gemini 3.8 Flash Vision</span>
  </div>
</body>
</html>`;

    const htmlPath = path.join(TMP_HTML_DIR, `slide_${String(slideNum).padStart(2, "0")}.html`);
    const pngPath = path.join(SLIDES_OUTPUT_DIR, `slide_${String(slideNum).padStart(2, "0")}.png`);

    fs.writeFileSync(htmlPath, singleSlideHtml, "utf-8");

    console.log(`[Slide ${slideNum}/${totalSlides}] Capturing 1920x1080 screenshot via chrome-headless-shell...`);
    const cmd = `"${CHROME_PATH}" --headless --no-sandbox --disable-gpu --window-size=1920,1080 --screenshot="${pngPath}" "file://${htmlPath}"`;
    try {
      execSync(cmd, { stdio: "ignore", timeout: 15000 });
      if (fs.existsSync(pngPath)) {
        const stats = fs.statSync(pngPath);
        console.log(`  -> Saved ${pngPath} (${Math.round(stats.size / 1024)} KB)`);
        slideImages.push(pngPath);
      } else {
        console.warn(`  -> Warning: ${pngPath} not generated!`);
      }
    } catch (err) {
      console.error(`  -> Error capturing slide ${slideNum}:`, err.message);
    }
  }

  console.log(`\nAll ${slideImages.length} slides captured as 1920x1080 PNG images!`);
  console.log("Generating 16:9 PowerPoint Presentation (.pptx)...");

  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "SafeStack Engineering Team";
  pres.company = "SafeStack Weather Guard";
  pres.title = "SafeStack Weather Guard Executive Technical Presentation";

  for (let i = 0; i < slideImages.length; i++) {
    const imgPath = slideImages[i];
    const slide = pres.addSlide();
    slide.addImage({
      path: imgPath,
      x: 0,
      y: 0,
      w: "100%",
      h: "100%",
    });
  }

  await pres.writeFile({ fileName: PPTX_OUTPUT });
  const pptxStats = fs.statSync(PPTX_OUTPUT);
  console.log(`\nSUCCESS! PPTX presentation generated: ${PPTX_OUTPUT} (${Math.round(pptxStats.size / 1024)} KB)`);
}

run().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
