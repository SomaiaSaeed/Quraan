import { NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { MaterialModule } from './material/material.module';
import { MainSearchComponent } from './main-search/main-search.component';
import { ReadersComponent } from './readers/readers.component';
@NgModule({
  declarations: [
    MainSearchComponent,
    ReadersComponent
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
