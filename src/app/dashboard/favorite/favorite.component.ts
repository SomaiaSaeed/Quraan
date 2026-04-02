import { Component, OnInit } from '@angular/core';
import { BookmarkService, BookmarkedAya } from '../../core/services/bookmark.service';

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss']
})
export class FavoriteComponent implements OnInit {

  bookmarks: BookmarkedAya[] = [];

  constructor(private _bookmarkService: BookmarkService) {}

  ngOnInit(): void {
    this.loadBookmarks();
  }

  loadBookmarks(): void {
    this.bookmarks = this._bookmarkService.getBookmarks();
  }

  remove(id: string): void {
    this._bookmarkService.removeBookmark(id);
    this.loadBookmarks();
  }
}
