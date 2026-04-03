import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PrintComponent } from 'src/app/shared/print/print.component';
import { ReadersComponent } from 'src/app/shared/readers/readers.component';
import { } from 'stream';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  isOpenMenu: boolean = false;

  constructor(public dialog: MatDialog,private router: Router) { }

  ngOnInit() {
  }

  OpenMenu() {
    this.isOpenMenu = !this.isOpenMenu
  }

  openReads(): void {
    const dialogRef = this.dialog.open(ReadersComponent, {
      width: "1000px",
      panelClass: "popup-center",
      data:this.isOpenMenu = false
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log("The dialog was closed");
    });
  }

  openPrint(): void {
    const dialogRef = this.dialog.open(PrintComponent, {
      width: "600px",
      panelClass: "popup-center",
      data:this.isOpenMenu = false
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log("The dialog was closed");
    });
  }

  openFavorite(){
    this.router.navigate(['/favorite']);
    this.isOpenMenu = false
  }

  openSimilarities(){
    this.router.navigate(['/similarities']);
    this.isOpenMenu = false
  }

  openAlsajadat(){
    this.router.navigate(['/alsajadat']);
    this.isOpenMenu = false
  }

  openFehres(){
    this.router.navigate(['/fehres']);
    this.isOpenMenu = false
  }

}
