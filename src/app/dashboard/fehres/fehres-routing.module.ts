import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FehresComponent } from './fehres.component';

const routes: Routes = [
  { path: '', component: FehresComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FehresRoutingModule { }
