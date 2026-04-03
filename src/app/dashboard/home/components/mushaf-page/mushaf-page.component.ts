import { HttpClient } from '@angular/common/http';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

const PAGES_URL = 'assets/jsonData/QuranPagesWithLines.json';

@Component({
  selector: 'app-mushaf-page',
  templateUrl: './mushaf-page.component.html',
  styleUrls: ['./mushaf-page.component.scss']
})
export class MushafPageComponent implements OnInit, OnChanges {

  @Input() pageNumber: number = 1;

  currentPage: any = null;
  private allPages: any[] = [];

  constructor(private _http: HttpClient) {}

  ngOnInit(): void {
    this._http.get<any[]>(PAGES_URL).subscribe(data => {
      this.allPages = data;
      this.loadPage(this.pageNumber);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pageNumber'] && this.allPages.length > 0) {
      this.loadPage(this.pageNumber);
    }
  }

  private loadPage(num: number): void {
    this.currentPage = this.allPages.find(p => p.pageNumber === num) ?? null;
  }

  get filledLines(): any[] {
    if (!this.currentPage) return Array(15).fill(null);
    const lines = this.currentPage.lines as any[];
    // Fill up to 15 lines; pad with empty if fewer
    const result = [...lines];
    while (result.length < 15) result.push({ text: '', lineNumber: result.length + 1 });
    return result;
  }
}
