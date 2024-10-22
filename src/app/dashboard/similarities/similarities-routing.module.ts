import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SimilaritiesComponent } from './pages/similarities/similarities.component';

const routes: Routes = [{ path: '', component: SimilaritiesComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SimilaritiesRoutingModule { }
