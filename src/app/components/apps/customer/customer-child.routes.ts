


import { Routes } from '@angular/router';
import { authGuard } from '../../../core/auth/auth.guard';

export const CUSTOMER_CHILD_ROUTES: Routes =[
  {
    path: '',
    loadComponent: () => import('./customer-list/customer-list.component').then(m => m.CustomerListComponent), title: 'Customer List', canActivate: [authGuard] },
    { path: 'customer-add', loadComponent: () => import('./customer-add/customer-add.component').then(m => m.CustomerAddComponent), title: 'Customer Add', canActivate: [authGuard] },
    { path: 'customer-detail/:id', loadComponent: () => import('./customer-detail/customer-detail.component').then(m => m.CustomerDetailComponent), title: 'Customer Detail', canActivate: [authGuard] },
    { path: 'customer-edit/:id', loadComponent: () => import('./customer-add/customer-add.component').then(m => m.CustomerAddComponent), title: 'Customer Edit', canActivate: [authGuard] },


  { path: 'stock', loadComponent: () => import('./stock/stock.component').then(m => m.StockComponent), title: 'Stock', canActivate: [authGuard] },
  ]
  
  