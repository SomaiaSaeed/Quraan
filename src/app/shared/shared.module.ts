import { NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { MaterialModule } from './material/material.module';
import { MainSearchComponent } from './main-search/main-search.component';

@NgModule({
  declarations: [
    MainSearchComponent
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
