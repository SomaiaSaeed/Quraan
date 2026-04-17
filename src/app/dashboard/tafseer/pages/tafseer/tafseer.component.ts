import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Search } from 'src/app/core/services/search.service';

@Component({
  selector: 'app-tafseer',
  templateUrl: './tafseer.component.html',
  styleUrls: ['./tafseer.component.scss']
})
export class TafseerComponent implements OnInit {

  readonly EDITIONS = [
    { id: 'ar.muyassar',   name: 'الميسر' },
    { id: 'ar.jalalayn',   name: 'الجلالين' },
    // { id: 'ar.ibnikathir', name: 'ابن كثير' },
    // { id: 'ar.tabari',     name: 'الطبري' },
    // { id: 'ar.wahidi',     name: 'الواحدي' },
  ];

  suraNames: string[] = [];
  ayaNumbers: number[] = [];

  selectedSura = '';
  selectedAya  = 1;
  edition      = 'ar.muyassar';

  ayaText     = '';
  tafseerText = '';
  loading     = false;
  error       = false;

  private _ayaId: number | null = null;

  constructor(private _http: HttpClient, private _search: Search) {}

  ngOnInit(): void {
    this.suraNames = [...new Set(
      this._search.table_othmani.map((r: any) => r.Sura_Name)
    )];
    this.selectedSura = this.suraNames[0];
    this._onSuraChange();
  }

  _onSuraChange(): void {
    const rows = this._search.table_othmani.filter(
      (r: any) => r.Sura_Name === this.selectedSura
    );
    this.ayaNumbers = rows.map((r: any) => Number(r.Aya_N));
    this.selectedAya = this.ayaNumbers[0];
    this._onAyaChange();
  }

  _onAyaChange(): void {
    const row = this._search.table_othmani.find(
      (r: any) => r.Sura_Name === this.selectedSura && Number(r.Aya_N) === this.selectedAya
    );
    if (!row) return;
    this._ayaId = Number(row.id);
    this.ayaText = row.AyaText_Othmani;
    this._fetch();
  }

  setEdition(id: string): void {
    this.edition = id;
    this._fetch();
  }

  prev(): void {
    const idx = this.ayaNumbers.indexOf(this.selectedAya);
    if (idx > 0) {
      this.selectedAya = this.ayaNumbers[idx - 1];
      this._onAyaChange();
    } else {
      // go to last aya of previous sura
      const suraIdx = this.suraNames.indexOf(this.selectedSura);
      if (suraIdx > 0) {
        this.selectedSura = this.suraNames[suraIdx - 1];
        const rows = this._search.table_othmani.filter((r: any) => r.Sura_Name === this.selectedSura);
        this.ayaNumbers = rows.map((r: any) => Number(r.Aya_N));
        this.selectedAya = this.ayaNumbers[this.ayaNumbers.length - 1];
        this._onAyaChange();
      }
    }
  }

  next(): void {
    const idx = this.ayaNumbers.indexOf(this.selectedAya);
    if (idx < this.ayaNumbers.length - 1) {
      this.selectedAya = this.ayaNumbers[idx + 1];
      this._onAyaChange();
    } else {
      // go to first aya of next sura
      const suraIdx = this.suraNames.indexOf(this.selectedSura);
      if (suraIdx < this.suraNames.length - 1) {
        this.selectedSura = this.suraNames[suraIdx + 1];
        this._onSuraChange();
      }
    }
  }

  private _fetch(): void {
    if (!this._ayaId) return;
    this.loading = true;
    this.error   = false;
    this.tafseerText = '';
    this._http
      .get<any>(`https://api.alquran.cloud/v1/ayah/${this._ayaId}/${this.edition}`)
      .subscribe({
        next: res => {
          this.tafseerText = res?.data?.text ?? 'لا يوجد تفسير متاح.';
          this.loading = false;
        },
        error: () => {
          this.error   = true;
          this.loading = false;
        }
      });
  }

  get currentEditionName(): string {
    return this.EDITIONS.find(e => e.id === this.edition)?.name ?? '';
  }
}
