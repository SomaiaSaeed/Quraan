import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ColumnDef {
  key: string;
  label: string;
  isDefault: boolean;
  type: 'othmani' | 'text' | 'badge' | 'plain';
  group: 'aya' | 'sura' | 'division' | 'page';
}

export const ALL_COLUMNS: ColumnDef[] = [
  // ── الآية ────────────────────────────────────────────────────────────────
  { key: 'AyaText_Othmani', label: 'نص الآية ',  isDefault: true,  type: 'othmani', group: 'aya'      },
  // { key: 'AyaText',         label: 'نص الآية (مبسط)',    isDefault: false, type: 'text',    group: 'aya'      },
  { key: 'Aya_N',           label: 'رقم الآية',           isDefault: true,  type: 'badge',   group: 'aya'      },
  // ── السورة ───────────────────────────────────────────────────────────────
  { key: 'Sura_Name',       label: 'اسم السورة',          isDefault: true,  type: 'plain',   group: 'sura'     },
  { key: 'nOFSura',         label: 'رقم السورة',           isDefault: false, type: 'badge',   group: 'sura'     },
  { key: 'suraStart',       label: 'بداية السورة',         isDefault: false, type: 'text',    group: 'sura'     },
  // ── التقسيم ──────────────────────────────────────────────────────────────
  { key: 'nOFJoz',          label: 'رقم الجزء',            isDefault: false, type: 'badge',   group: 'division' },
  { key: 'joz',             label: 'الجزء',                isDefault: false, type: 'plain',   group: 'division' },
  { key: 'nOFHezb',         label: 'رقم الحزب',            isDefault: false, type: 'badge',   group: 'division' },
  { key: 'hezb',            label: 'الحزب',                isDefault: false, type: 'plain',   group: 'division' },
  { key: 'rub',             label: 'الربع',                isDefault: false, type: 'plain',   group: 'division' },
  // { key: 'rubStart',        label: 'بداية الربع',           isDefault: false, type: 'text',    group: 'division' },
  // ── الصفحة ───────────────────────────────────────────────────────────────
  { key: 'nOFPage',         label: 'رقم الصفحة',           isDefault: false, type: 'badge',   group: 'page'     },
  { key: 'pageStart',       label: 'بداية الصفحة',          isDefault: false, type: 'text',    group: 'page'     },
];

const STORAGE_KEY = 'searchColumns';

function loadColumns(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : ALL_COLUMNS.filter(c => c.isDefault).map(c => c.key);
  } catch {
    return ALL_COLUMNS.filter(c => c.isDefault).map(c => c.key);
  }
}

@Injectable({ providedIn: 'root' })
export class DataSharingService {
  private selectedDataSubject = new BehaviorSubject<{ data: any[], searchQuery: string }>({ data: [], searchQuery: '' });
  selectedData$ = this.selectedDataSubject.asObservable();

  private selectedColumnsSubject = new BehaviorSubject<string[]>(loadColumns());
  selectedColumns$ = this.selectedColumnsSubject.asObservable();

  get currentColumns(): string[] { return this.selectedColumnsSubject.value; }

  updateSelectedData(data: any[], searchQuery: string) {
    this.selectedDataSubject.next({ data, searchQuery });
  }

  updateColumns(keys: string[]) {
    this.selectedColumnsSubject.next(keys);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(keys)); } catch { /* ignore */ }
  }

  resetColumns() {
    const defaults = ALL_COLUMNS.filter(c => c.isDefault).map(c => c.key);
    this.updateColumns(defaults);
  }
}
