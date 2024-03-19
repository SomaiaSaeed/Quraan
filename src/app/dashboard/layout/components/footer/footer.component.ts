import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { Router } from '@angular/router';
import { PrintComponent } from 'src/app/shared/print/print.component';
import { ReadersComponent } from 'src/app/shared/readers/readers.component';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
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
}
