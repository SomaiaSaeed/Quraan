import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ListenService, Reader, READERS } from 'src/app/dashboard/listen/services/listen.service';

@Component({
  selector: 'app-readers',
  templateUrl: './readers.component.html',
  styleUrls: ['./readers.component.scss']
})
export class ReadersComponent {
  readers = READERS;

  constructor(public dialog: MatDialog, public listenService: ListenService) {}

  selectReader(reader: Reader): void {
    this.listenService.setReader(reader);
    this.dialog.closeAll();
  }

  closeDialog(): void {
    this.dialog.closeAll();
  }
}
