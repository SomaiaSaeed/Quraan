import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: '/', pathMatch: 'full' },

  { path: 'listen', loadChildren: () => import('./dashboard/listen/listen.module').then(m => m.ListenModule) },
  
  { path: 'test', loadChildren: () => import('./dashboard/test/test.module').then(m => m.TestModule) }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
