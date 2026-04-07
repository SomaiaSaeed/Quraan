import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const STORAGE_KEY = 'searchHistory';
const MAX_ITEMS   = 10;

/**
 * Single source of truth for search history.
 * Both MainSearchComponent and FormComponent inject this service,
 * eliminating the race-condition caused by independent localStorage writes (Bug 5).
 */
@Injectable({ providedIn: 'root' })
export class SearchHistoryService {

  private historySubject = new BehaviorSubject<string[]>(this.load());
  /** Observable list, oldest-first. */
  history$ = this.historySubject.asObservable();

  /** Most-recent first — convenience getter for dropdowns. */
  get items(): string[] { return [...this.historySubject.value].reverse(); }

  add(query: string): void {
    if (!query?.trim()) return;
    const list = [...this.historySubject.value];
    const idx  = list.indexOf(query);
    if (idx !== -1) list.splice(idx, 1);
    list.push(query);
    if (list.length > MAX_ITEMS) list.shift();
    this.save(list);
  }

  remove(query: string): void {
    const list = this.historySubject.value.filter(w => w !== query);
    this.save(list);
  }

  clear(): void { this.save([]); }

  private load(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  }

  private save(list: string[]): void {
    this.historySubject.next(list);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch { /* quota exceeded */ }
  }
}
