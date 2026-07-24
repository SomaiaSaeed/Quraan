import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {
  AyaCompareDialogData,
  AyaCompareDialogResult,
  AyaCompareRef,
} from "src/app/core/models/aya-compare.model";

interface DiffWord {
  word: string;
  matches: boolean;
}

/** Arabic diacritics (harakat/tanwin/etc.) — stripped before comparing words so tashkeel differences don't count as real divergences */
const TASHKEEL_PATTERN = /[ؐ-ًؚ-ٰٟۖ-ۭ]/g;

@Component({
  selector: "app-aya-compare-dialog",
  templateUrl: "./aya-compare-dialog.component.html",
  styleUrls: ["./aya-compare-dialog.component.scss"],
})
export class AyaCompareDialogComponent {
  constructor(
    private _dialogRef: MatDialogRef<AyaCompareDialogComponent, AyaCompareDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: AyaCompareDialogData
  ) {}

  get currentWords(): DiffWord[] {
    return this.data.current.text.split(" ").map((word) => ({ word, matches: false }));
  }

  /** Words of `target`, flagged where they match the current aya at the same position (tashkeel-insensitive) */
  diffWordsFor(target: AyaCompareRef): DiffWord[] {
    const currentWords = this.data.current.text.split(" ");
    const targetWords = target.text.split(" ");
    return targetWords.map((word, i) => ({
      word,
      matches: this.stripTashkeel(word) === this.stripTashkeel(currentWords[i] ?? ""),
    }));
  }

  private stripTashkeel(word: string): string {
    return word.replace(TASHKEEL_PATTERN, "");
  }

  jumpTo(target: AyaCompareRef): void {
    this._dialogRef.close({ jumpTo: target });
  }

  close(): void {
    this._dialogRef.close();
  }
}
