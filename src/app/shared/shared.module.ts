import { NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { MaterialModule } from './material/material.module';
import { MainSearchComponent } from './main-search/main-search.component';
import { ReadersComponent } from './readers/readers.component';
import { PrintComponent } from './print/print.component';
@NgModule({
  declarations: [
    MainSearchComponent,
    ReadersComponent,
    PrintComponent
  ],
  imports: [
    MaterialModule,
    CommonModule
  ],
  exports:[
    
    MainSearchComponent,
    MaterialModule,

  ]
})
export class SharedModule { }
