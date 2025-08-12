import { Routes } from '@angular/router';
import { authGuard } from '../../../../core/auth/auth.guard';

export const PRODUCT_ROUTES: Routes = [
    { path: '', loadComponent: () => import('./product-list/product-list.component').then(m => m.ProductListComponent), title: 'Product List', canActivate: [authGuard] },
    { path: 'product-add', loadComponent: () => import('./product-add/product-add.component').then(m => m.ProductAddComponent), title: 'Product Add', canActivate: [authGuard] },
    { path: 'product-detail/:id', loadComponent: () => import('./product-detail/product-detail.component').then(m => m.ProductDetailComponent), title: 'Product Detail', canActivate: [authGuard] },
    { path: 'product-edit/:id', loadComponent: () => import('./product-add/product-add.component').then(m => m.ProductAddComponent), title: 'Product Edit', canActivate: [authGuard] },
];