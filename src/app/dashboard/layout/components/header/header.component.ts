import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PrintComponent } from 'src/app/shared/print/print.component';
import { ReadersComponent } from 'src/app/shared/readers/readers.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  isOpenMenu: boolean = false;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {}

  toggleDropdown() {
    this.isOpenMenu = !this.isOpenMenu;
  }

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: HTMLElement) {
    if (this.isOpenMenu && !this.elementRef.nativeElement.contains(target)) {
      this.isOpenMenu = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.isOpenMenu = false;
  }

  private closeMenu() {
    this.isOpenMenu = false;
  }

  openReads(): void {
    const dialogRef = this.dialog.open(ReadersComponent, {
      width: '1000px',
      panelClass: 'popup-center',
      data: null,
    });
    this.closeMenu();
    dialogRef.afterClosed().subscribe(() => {});
  }

  openPrint(): void {
    const dialogRef = this.dialog.open(PrintComponent, {
      width: '600px',
      panelClass: 'popup-center',
      data: null,
    });
    this.closeMenu();
    dialogRef.afterClosed().subscribe(() => {});
  }

  openFavorite() {
    this.router.navigate(['/favorite']);
    this.closeMenu();
  }

  openSimilarities() {
    this.router.navigate(['/similarities']);
    this.closeMenu();
  }

  openAlsajadat() {
    this.router.navigate(['/alsajadat']);
    this.closeMenu();
  }

  openFehres() {
    this.router.navigate(['/fehres']);
    this.closeMenu();
  }

  openTafseer() {
    this.router.navigate(['/tafseer']);
    this.closeMenu();
  }
}
