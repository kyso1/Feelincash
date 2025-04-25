import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'inserir',
    loadChildren: () => import('./main/inserir/inserir.module').then( m => m.InserirPageModule)
  },
  {
    path: 'transactions',
    loadChildren: () => import('./main/transactions/transactions.module').then( m => m.TransactionsPageModule)
  },
  {
    path: 'graphic',
    loadChildren: () => import('./main/graphic/graphic.module').then( m => m.GraphicPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./main/home/home.module').then( m => m.HomePageModule)
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
