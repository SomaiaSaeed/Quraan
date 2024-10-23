import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AlsajadatComponent } from './alsajadat.component';

const routes: Routes = [{ path: '', component: AlsajadatComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AlsajadatRoutingModule { }
