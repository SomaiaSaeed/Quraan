/**
 * Post-processes QuranPagesWithLines.json by adding a `text` field
 * to each line, built from word positions + QuranInJson aya texts.
 *
 * Usage:  node scripts/addLineText.js
 */

const fs   = require('fs');
const path = require('path');

const QURAN_JSON  = path.join(__dirname, '../src/assets/jsonData/QuranInJson.json');
const PAGES_PATH  = path.join(__dirname, '../src/assets/jsonData/QuranPagesWithLines.json');

const quranJson = JSON.parse(fs.readFileSync(QURAN_JSON, 'utf8'));
const pages     = JSON.parse(fs.readFileSync(PAGES_PATH, 'utf8'));

// Build verse lookup: "1:1" → { text, suraName, suraIndex }
const verseLookup = {};
quranJson.forEach(sura => {
  sura.aya.forEach(aya => {
    verseLookup[`${sura.index}:${aya.index}`] = {
      text:      aya.text,
      suraName:  sura.name,
      suraIndex: sura.index,
      ayaIndex:  aya.index
    };
  });
});

let warnings = 0;

pages.forEach(page => {
  page.lines.forEach(line => {
    const parts = [];

    line.segments.forEach(segment => {
      const entry = verseLookup[segment.verseKey];
      if (!entry) {
        console.warn(`Missing verseKey: ${segment.verseKey}`);
        warnings++;
        return;
      }

      const words = entry.text.split(' ');
      const picked = segment.wordPositions
        .map(pos => words[pos - 1])
        .filter(Boolean);

      // Append aya-end marker (aya number circle) after last word if this segment
      // ends at the last word of the aya
      const isLastWordOfAya = segment.wordPositions.includes(words.length);
      const segText = picked.join(' ') + (isLastWordOfAya ? ` ﴿${entry.ayaIndex}﴾` : '');
      parts.push(segText);
    });

    line.text = parts.join(' ');

    // Detect if this is a basmala line (first segment is 1:1 with all 4 words,
    // or any sura-opening basmala)
    const firstSeg = line.segments[0];
    line.isBasmala = firstSeg &&
      firstSeg.verseKey.endsWith(':1') &&
      firstSeg.wordPositions.length === 4 &&
      firstSeg.wordPositions[0] === 1 &&
      line.segments.length === 1;

    // Detect first aya of sura (for centering)
    line.isSuraStart = firstSeg &&
      firstSeg.verseKey.endsWith(':1') &&
      firstSeg.wordPositions[0] === 1;
  });
});

fs.writeFileSync(PAGES_PATH, JSON.stringify(pages, null, 2), 'utf8');
console.log(`Done. ${warnings} warnings. Saved to ${PAGES_PATH}`);
