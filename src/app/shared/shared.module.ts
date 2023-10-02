import { NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { MaterialModule } from './material/material.module';

@NgModule({
  declarations: [

  ],
  imports: [
    MaterialModule,
  ],
  exports:[
    MaterialModule

  ]
})
export class SharedModule { }
