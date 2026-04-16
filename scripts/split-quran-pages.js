/**
 * Splits large Quran JSON files into per-page files for fast initial loading.
 * Run once: node scripts/split-quran-pages.js
 */

const fs   = require('fs');
const path = require('path');

const dataDir = path.resolve(__dirname, '../src/assets/jsonData');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ── QuranPagesWithLines.json (8.8 MB) → mushaf-lines/page-{n}.json ─────────
const mushafLinesDir = path.join(dataDir, 'mushaf-lines');
ensureDir(mushafLinesDir);

console.log('Reading QuranPagesWithLines.json (8.8 MB)...');
const pagesWithLines = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'QuranPagesWithLines.json'), 'utf8')
);
pagesWithLines.forEach(page => {
  fs.writeFileSync(
    path.join(mushafLinesDir, `page-${page.pageNumber}.json`),
    JSON.stringify(page)
  );
});
console.log(`✓ Created ${pagesWithLines.length} files in assets/jsonData/mushaf-lines/`);

// ── QuranPages.json (3.3 MB) → quran-pages/page-{n}.json ────────────────────
const quranPagesDir = path.join(dataDir, 'quran-pages');
ensureDir(quranPagesDir);

console.log('Reading QuranPages.json (3.3 MB)...');
const quranPages = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'QuranPages.json'), 'utf8')
);
quranPages.forEach(page => {
  fs.writeFileSync(
    path.join(quranPagesDir, `page-${page.pageNumber}.json`),
    JSON.stringify(page)
  );
});
console.log(`✓ Created ${quranPages.length} files in assets/jsonData/quran-pages/`);

console.log('\nDone! Total pages:', pagesWithLines.length);
