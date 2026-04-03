import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Search } from 'src/app/core/services/search.service';

interface SuraEntry {
  index: number;
  name: string;
  ayaCount: number;
  page: number;
  type: string; // مكية / مدنية
}

interface JuzEntry {
  index: number;
  suraName: string;
  ayaNumber: number;
  page: number;
}

@Component({
  selector: 'app-fehres',
  templateUrl: './fehres.component.html',
  styleUrls: ['./fehres.component.scss']
})
export class FehresComponent implements OnInit {
  activeTab: 'suras' | 'juz' = 'suras';
  suras: SuraEntry[] = [];
  juzList: JuzEntry[] = [];

  constructor(private _search: Search, private _router: Router) {}

  ngOnInit(): void {
    this.buildSuras();
    this.buildJuz();
  }

  private buildSuras(): void {
    const map = new Map<number, SuraEntry>();
    this._search.table_othmani.forEach((row: any) => {
      const n = Number(row.nOFSura);
      if (!map.has(n)) {
        map.set(n, {
          index: n,
          name: row.Sura_Name,
          ayaCount: 0,
          page: Number(row.nOFPage)
        } as any);
      }
      map.get(n)!.ayaCount++;
    });
    this.suras = Array.from(map.values()).sort((a, b) => a.index - b.index);
  }

  private buildJuz(): void {
    const map = new Map<number, JuzEntry>();
    this._search.table_othmani.forEach((row: any) => {
      const j = Number(row.nOFJoz);
      if (!j || isNaN(j)) return;
      if (!map.has(j)) {
        map.set(j, {
          index: j,
          suraName: row.Sura_Name,
          ayaNumber: Number(row.Aya_N),
          page: Number(row.nOFPage)
        });
      }
    });
    this.juzList = Array.from(map.values()).sort((a, b) => a.index - b.index);
  }

  goToPage(page: number): void {
    localStorage.setItem('pendingNavPage', String(page));
    this._router.navigate(['/home']);
  }

  toArabic(n: number): string {
    const d = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
    return n.toString().split('').map(c => d[+c] ?? c).join('');
  }
}
