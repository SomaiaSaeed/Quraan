import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// import { DataService } from 'src/app/dashboard/todo-list/services/getDataSearch.service';
import { } from 'stream';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  receivedData: any[] | any;
  receivedData2: any[] | any;
  receivedData3: any[] | any;
  searchTerm: string = '';
  test: string | any;
// private dataService: DataService
  constructor(private _router: Router) { }

  ngOnInit() {
    // this.dataService.currentData.subscribe(res => {
    //   if(!this.searchTerm){
    //     this.receivedData = res
    //   }
    // })
  }

  addTaskForm() {
    this._router.navigate(['add-task'], { skipLocationChange: true });
  }

  searchItems(event:Event) {
    // if (!this.searchTerm ) {
    //   this.dataService.resultData(this.receivedData)  
    // } else {
    //   this.receivedData2 = this.receivedData.filter((item: any) => item.title.toLowerCase().includes(this.searchTerm.toLowerCase()));
    //   this.dataService.resultData(this.receivedData2)
    // }
  }
}
