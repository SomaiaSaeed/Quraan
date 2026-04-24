import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PrintService {
  /** Populated by QuraanImagesComponent after mushafLines are built */
  quranPages: any[] = [];

  /** Cached heavy JSON — survives route navigation so re-visits are instant */
  quranInJson:    any    = null;  // QuranInJson.json   (~12 MB)
  quranPagesData: any[]  = [];    // QuranPages.json
  pagesWithLines: any[]  = [];    // QuranPagesWithLines.json
}
