import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PrintService {
  /** Populated by QuraanImagesComponent after mushafLines are built */
  quranPages: any[] = [];
}
