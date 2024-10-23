import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AlsajadatRoutingModule } from './alsajadat-routing.module';
import { AlsajadatComponent } from './alsajadat.component';
import { SearchTableComponent } from './components/search-table/search-table.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    AlsajadatComponent,
    SearchTableComponent
  ],
  imports: [
    CommonModule,
    AlsajadatRoutingModule,
    SharedModule
  ]
})
export class AlsajadatModule { }
