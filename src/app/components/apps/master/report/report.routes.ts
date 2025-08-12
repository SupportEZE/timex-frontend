import { Routes } from '@angular/router';
import { authGuard } from '../../../../core/auth/auth.guard';

export const REPORT_ROUTES: Routes = [
    { path: '', loadComponent: () => import('./report-list/report-list.component').then(m => m.ReportListComponent), title: 'Reporrt List', canActivate: [authGuard] },
];