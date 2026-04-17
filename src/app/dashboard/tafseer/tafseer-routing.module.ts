import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TafseerComponent } from './pages';

const routes: Routes = [{ path: '', component: TafseerComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TafseerRoutingModule { }
