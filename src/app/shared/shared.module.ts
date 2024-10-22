import { NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { MaterialModule } from './material/material.module';
import { MainSearchComponent } from './main-search/main-search.component';
import { ReadersComponent } from './readers/readers.component';
import { PrintComponent } from './print/print.component';
import { NoResultsComponent } from './no-results/no-results.component';
@NgModule({
  declarations: [
    MainSearchComponent,
    ReadersComponent,
    PrintComponent,
    NoResultsComponent
  ],
  imports: [
    MaterialModule,
    CommonModule
  ],
  exports:[
    NoResultsComponent,
    MainSearchComponent,
    MaterialModule,

  ]
})
export class SharedModule { }
