export interface AyaCompareRef {
  suraName: string;
  ayaIndex: number;
  text: string;
  /** Numeric sura position (1-114) — only needed to jump to this aya, not for display */
  suraIndex?: number;
}

export interface AyaCompareDialogData {
  current: AyaCompareRef;
  targets: AyaCompareRef[];
}

export interface AyaCompareDialogResult {
  jumpTo: AyaCompareRef;
}
