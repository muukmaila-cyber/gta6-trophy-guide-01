// Entrypoint for the GTA VI trophy guide entry (make.fun gta6-trophy-guide-01).
//
// What it does, in plain terms: it gathers the three things the grader
// needs into one output folder — the static guide itself (app/), the
// screenshots of it (screenshots/), and dossier.json, the summary the
// judge reads, produced by the vendored make.fun library.
//
// Nothing here fetches anything over the network and there is no build
// step: the guide is plain files, so this script only copies files and
// writes the dossier. It runs on Node 22 with the standard library alone.
//
// Usage (outside the grader's container, where /output does not exist):
//   MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The folder this file lives in is the repository root.
const repoDir = fileURLToPath(new URL('.', import.meta.url));

// Where the finished entry goes: the grader's /output, or whatever the
// MAKEFUN_OUTPUT_DIR environment variable names when running locally.
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(folderName) {
  const from = join(repoDir, folderName);
  if (!existsSync(from)) return false;
  cpSync(from, join(outDir, folderName), { recursive: true });
  return true;
}

mkdirSync(outDir, { recursive: true });
copyTree('app');
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
copyTree('screenshots');

// The dossier's caps mirror the scorer's own limits: at most 4 screenshots
// of 256 KiB each, at most 993 files totalling 48 MiB under app/, and a
// judge-view text budget of 160 KiB.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
