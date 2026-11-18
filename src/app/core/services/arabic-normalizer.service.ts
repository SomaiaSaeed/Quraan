import { Injectable } from '@angular/core';

/**
 * Centralised Arabic text normalisation used by all search components.
 * Having one place ensures all components stay in sync when Unicode rules change.
 *
 * Two normalisation levels:
 *  strip()       – replaces superscript alef (U+0670) with ا  → matches AyaText (الرحمان)
 *  stripSimple() – removes  superscript alef (U+0670) entirely → matches typed الرحمن
 *
 * Both fold the Uthmani spellings onto the modern ones people actually type:
 * ءَامَنُوا۟ → آمنوا, أَرَءَيْتُم → أرأيتم, ٱلصَّلَوٰة → الصلاة. Without that the
 * search silently returns nothing for very common words.
 */
@Injectable({ providedIn: 'root' })
export class ArabicNormalizerService {

  // Pre-compiled – instantiated once, not on every call (performance fix)
  private static readonly RE_TASHKEEL     = /[\u064B-\u065F]/g; // tashkeel: tanwin, kasra, fatha, damma, shadda, sukun … (U+064B–U+065F)
  private static readonly RE_SUP_ALEF     = /\u0670/g;  //  → ا (e.g. ٱلرَّحْمَٰنِ → الرحمان)
  private static readonly RE_HAMZA        = /[\u0623\u0625]/g;   // أ إ → ا  (Issue 24)
  private static readonly RE_ALEF_WASLA   = /\u0671/g;           // ٱ → ا  (Othmani word-start alef)
  private static readonly RE_ALEF_MAQSURA = /\u0649/g;           // ى → ي  (final yeh without dots)
  private static readonly RE_QURAN_MARKS  =
    /[\u06DF\u06E0\u06E2\u06E5\u06E6\u06E8\u06EA\u06EB\u06EC\u06ED\u06DC]/g; // Quranic annotation marks: ۟(06DF) ۠(06E0) ۢ(06E2) ۥ(06E5) ۦ(06E6) ۨ(06E8) ۪(06EA) ۫(06EB) ۬(06EC) ۭ(06ED) ۜ(06DC)
  private static readonly RE_KASHIDA      = /\u0640/g;  // kashida (tatweel) ـ  → removed (Arabic elongation stroke)
  // Uthmani → modern spelling. Order matters: the two-character sequences first.
  private static readonly RE_HAMZA_ALEF   = /\u0621\u0627/g;     // ءا (ءَامَنُوا) → ا, i.e. modern آ
  private static readonly RE_WAW_SUP_ALEF = /\u0648\u0670/g;     // وٰ (ٱلصَّلَوٰة) → ا, i.e. modern الصلاة
  private static readonly RE_ALEF_MADDA   = /\u0622/g;           // آ → ا
  private static readonly RE_HAMZA_LONE   = /\u0621/g;           // ء (أَرَءَيْتُم, شَىْء) → ا

  /** Shared by both levels; everything except how U+0670 is treated. */
  private common(text: string): string {
    return text
      .replace(ArabicNormalizerService.RE_TASHKEEL,     '')
      .replace(ArabicNormalizerService.RE_HAMZA,        '\u0627')
      .replace(ArabicNormalizerService.RE_HAMZA_ALEF,   '\u0627')
      .replace(ArabicNormalizerService.RE_WAW_SUP_ALEF, '\u0627')
      .replace(ArabicNormalizerService.RE_ALEF_MADDA,   '\u0627')
      .replace(ArabicNormalizerService.RE_HAMZA_LONE,   '\u0627')
      .replace(ArabicNormalizerService.RE_ALEF_WASLA,   '\u0627')
      .replace(ArabicNormalizerService.RE_ALEF_MAQSURA, '\u064A')
      .replace(ArabicNormalizerService.RE_QURAN_MARKS,  '')
      .replace(ArabicNormalizerService.RE_KASHIDA,      '');
  }

  /** Full normalisation: U+0670 → ا  (matches AyaText / Othmani paste). */
  strip(text: string): string {
    return this.common(text).replace(ArabicNormalizerService.RE_SUP_ALEF, '\u0627');
  }

  /** Simple normalisation: U+0670 stripped (matches typed الرحمن, not الرحمان). */
  stripSimple(text: string): string {
    return this.common(text).replace(ArabicNormalizerService.RE_SUP_ALEF, '');
  }

  /**
   * Does this aya contain the query? Both of its texts are tried, because the two
   * columns spell some words differently (الرحمان vs الرحمن). One place, so the
   * popup and the results page can never answer this differently.
   */
  ayaMatches(ayaText: string, ayaOthmani: string, query: string): boolean {
    return this.strip(ayaText || '').includes(this.strip(query))
        || this.stripSimple((ayaOthmani || '').trim()).includes(this.stripSimple(query));
  }

  /**
   * Is this single word the one searched for? Used for highlighting, where a plain
   * "contains" lights up بِأَنفُسِهِنَّ for the query إن. A leading conjunction is
   * allowed so وإن / فأراد still highlight.
   */
  wordMatches(word: string, queryTerm: string): boolean {
    if (!queryTerm) return false;
    const w = this.stripSimple(word);
    const q = this.stripSimple(queryTerm);
    if (!w || !q) return false;
    return w === q || w.startsWith(q) || w.replace(/^[\u0648\u0641]/, '').startsWith(q);
  }
}
