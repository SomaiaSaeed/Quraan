import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {path:'', redirectTo:"/tailwind-UI", pathMatch:'full'},
  { path: 'tailwind-UI', loadChildren: () => import('./tailwind-ui/tailwind-ui.module').then(m => m.TailwindUIModule) },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
