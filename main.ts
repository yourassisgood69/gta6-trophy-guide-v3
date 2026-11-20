import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

// Hand this entry in: copy the guide and its screenshots into the output
// folder, then write the dossier the vendor library builds from them.
const here = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";

mkdirSync(outputDir, { recursive: true });

const appSource = join(here, "app");
const appTarget = join(outputDir, "app");
cpSync(appSource, appTarget, { recursive: true });

const shotsSource = join(here, "screenshots");
const shotsTarget = join(outputDir, "screenshots");
mkdirSync(shotsTarget, { recursive: true });
if (existsSync(shotsSource)) {
  cpSync(shotsSource, shotsTarget, { recursive: true });
}

const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000
});
writeFileSync(join(outputDir, "dossier.json"), dossier);
