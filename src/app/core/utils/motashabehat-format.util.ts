import { AyaCompareRef } from "src/app/core/models/aya-compare.model";

export interface MotashabehatGroup {
  text: string;
  highlighted: boolean;
  entries: AyaCompareRef[];
}

const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export function toArabicNumber(num: number): string {
  return num
    .toString()
    .split("")
    .map((d) => ARABIC_DIGITS[+d])
    .join("");
}

/**
 * One group per consecutive run of the same sura in `moade3List`'s existing order
 * (match strength, then mushaf order — sorted upstream in generateMotashabehatOfSelectedPage).
 * aya# within a run share one set of brackets, comma-separated; the sura name is only
 * repeated when it differs from the run before it. Shared by the live mushaf boxes and print.
 */
export function formatMoade3Entries(
  moade3List: { suraWithIndex: string; aya?: string; suraIndex?: number }[],
  activeAya?: number
): MotashabehatGroup[] {
  const seen = new Set<string>();
  const groups: { suraName: string; indexes: number[]; highlighted: boolean; entries: AyaCompareRef[] }[] = [];

  moade3List.forEach((item) => {
    const match = (item.suraWithIndex || "").match(/^(.*)\s*\((\d+)\)$/);
    if (!match) return;

    const suraName = match[1].trim();
    const index = Number(match[2]);
    const key = `${suraName}(${index})`;
    if (seen.has(key)) return;
    seen.add(key);

    const highlighted = activeAya ? index === activeAya : false;
    const entry: AyaCompareRef = {
      suraName,
      ayaIndex: index,
      text: item.aya ?? "",
      suraIndex: item.suraIndex,
    };
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.suraName === suraName) {
      lastGroup.indexes.push(index);
      lastGroup.highlighted = lastGroup.highlighted || highlighted;
      lastGroup.entries.push(entry);
    } else {
      groups.push({ suraName, indexes: [index], highlighted, entries: [entry] });
    }
  });

  return groups.map((g) => ({
    text: `${g.suraName} (${g.indexes.map((i) => toArabicNumber(i)).join("، ")})`,
    highlighted: g.highlighted,
    entries: g.entries,
  }));
}
