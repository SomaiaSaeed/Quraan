import { Injectable } from '@angular/core';

export interface BookmarkedAya {
  id: string;
  text: string;
  suraName: string;
  ayaNumber: string | number;
  notes: string;
  savedAt: string;
}

const STORAGE_KEY = 'quran_bookmarks';

@Injectable({ providedIn: 'root' })
export class BookmarkService {

  getBookmarks(): BookmarkedAya[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  saveBookmark(aya: { id: any; text: string; suraName: string; ayaNumber: string | number }, notes: string): void {
    const bookmarks = this.getBookmarks();
    const existing = bookmarks.findIndex(b => b.id === aya.id.toString());
    const entry: BookmarkedAya = {
      id: aya.id.toString(),
      text: aya.text,
      suraName: aya.suraName,
      ayaNumber: aya.ayaNumber,
      notes,
      savedAt: new Date().toISOString()
    };
    if (existing >= 0) {
      bookmarks[existing] = entry;
    } else {
      bookmarks.push(entry);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  }

  removeBookmark(id: string): void {
    const bookmarks = this.getBookmarks().filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  }
}
