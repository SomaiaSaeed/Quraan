import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'listen', loadChildren: () => import('./dashboard/listen/listen.module').then(m => m.ListenModule) },
  { path: 'test', loadChildren: () => import('./dashboard/test/test.module').then(m => m.TestModule) },
  { path: 'search', loadChildren: () => import('./dashboard/search/search.module').then(m => m.SearchModule) },
  { path: 'home', loadChildren: () => import('./dashboard/home/home.module').then(m => m.HomeModule) },
  { path: 'favorite', loadChildren: () => import('./dashboard/favorite/favorite.module').then(m => m.FavoriteModule) },
  { path: 'similarities', loadChildren: () => import('./dashboard/similarities/similarities.module').then(m => m.SimilaritiesModule) }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
