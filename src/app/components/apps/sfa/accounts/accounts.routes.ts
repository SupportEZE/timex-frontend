import { Routes } from '@angular/router';
import { authGuard } from '../../../../core/auth/auth.guard';

export const ACCOUNTS_ROUTES: Routes = [
    { path: 'invoice', loadComponent: () => import('./invoice/invoice-list/invoice-list.component').then(m => m.InvoiceListComponent), title: 'Invoice List', canActivate: [authGuard] },
    { path: 'invoice-add', loadComponent: () => import('./invoice/invoice-add/invoice-add.component').then(m => m.InvoiceAddComponent), title: 'Invoice Add', canActivate: [authGuard] },
    { path: 'invoice-detail/:id', loadComponent: () => import('./invoice/invoice-detail/invoice-detail.component').then(m => m.InvoiceDetailComponent), title: 'Invoice Detail', canActivate: [authGuard] },
];
