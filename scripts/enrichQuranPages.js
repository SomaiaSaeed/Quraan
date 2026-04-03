/**
 * Enriches QuranPages.json with Madinah Mushaf line-break data.
 *
 * For each page it calls the Quran.com CDN API to get word-level data
 * (including line_number), then adds a `lines` array to each page entry.
 *
 * Output: src/assets/jsonData/QuranPagesWithLines.json
 *
 * Usage:  node scripts/enrichQuranPages.js
 */

const fs   = require('fs');
const path = require('path');
const https = require('https');

const INPUT_PATH  = path.join(__dirname, '../src/assets/jsonData/QuranPages.json');
const OUTPUT_PATH = path.join(__dirname, '../src/assets/jsonData/QuranPagesWithLines.json');
const TOTAL_PAGES = 604;
const DELAY_MS    = 1000; // 1 request per second

// ── helpers ──────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchPage(pageNumber) {
  return new Promise((resolve, reject) => {
    const url = `https://api.qurancdn.com/api/qdc/verses/by_page/${pageNumber}?words=true&word_fields=line_number,page_number&per_page=50`;
    https.get(url, { headers: { 'Accept': 'application/json' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`JSON parse error on page ${pageNumber}: ${e.message}`)); }
      });
    }).on('error', reject);
  });
}

/**
 * From the API response, build a `lines` array:
 * [
 *   { lineNumber: 1, segments: [ { verseKey: "1:1", wordPositions: [1,2,3] } ] },
 *   ...
 * ]
 */
function buildLines(apiResponse) {
  const lineMap = {}; // lineNumber → { verseKey → [wordPositions] }

  for (const verse of (apiResponse.verses || [])) {
    for (const word of (verse.words || [])) {
      if (!word.line_number) continue;
      const ln = word.line_number;
      if (!lineMap[ln]) lineMap[ln] = {};
      if (!lineMap[ln][verse.verse_key]) lineMap[ln][verse.verse_key] = [];
      lineMap[ln][verse.verse_key].push(word.position);
    }
  }

  return Object.keys(lineMap)
    .map(Number)
    .sort((a, b) => a - b)
    .map(lineNumber => ({
      lineNumber,
      segments: Object.entries(lineMap[lineNumber]).map(([verseKey, positions]) => ({
        verseKey,
        wordPositions: positions.sort((a, b) => a - b)
      }))
    }));
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Reading existing QuranPages.json …');
  const quranPages = JSON.parse(fs.readFileSync(INPUT_PATH, 'utf8'));

  // Build a page-number → index map for quick lookup
  const pageMap = {};
  quranPages.forEach((p, i) => { pageMap[p.pageNumber] = i; });

  // Resume support: if output already exists, skip pages already done
  let result = [];
  if (fs.existsSync(OUTPUT_PATH)) {
    result = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'));
    console.log(`Resuming — ${result.length} pages already processed.`);
  }

  const startPage = result.length + 1;

  for (let pageNum = startPage; pageNum <= TOTAL_PAGES; pageNum++) {
    process.stdout.write(`\rFetching page ${pageNum}/${TOTAL_PAGES} …`);

    let apiData;
    let retries = 3;
    while (retries > 0) {
      try {
        apiData = await fetchPage(pageNum);
        break;
      } catch (err) {
        retries--;
        if (retries === 0) {
          console.error(`\nFailed page ${pageNum} after 3 retries: ${err.message}`);
          // Write progress so far and exit
          fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2), 'utf8');
          process.exit(1);
        }
        await sleep(2000);
      }
    }

    const originalPage = quranPages[pageMap[pageNum]];
    result.push({
      ...originalPage,
      lines: buildLines(apiData)
    });

    // Save incrementally every 10 pages
    if (pageNum % 10 === 0 || pageNum === TOTAL_PAGES) {
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2), 'utf8');
    }

    if (pageNum < TOTAL_PAGES) await sleep(DELAY_MS);
  }

  console.log(`\nDone! Saved to ${OUTPUT_PATH}`);
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
