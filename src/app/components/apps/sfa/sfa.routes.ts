import { Routes } from '@angular/router';
import { ACCOUNTS_ROUTES } from './accounts/accounts.routes';
import { authGuard } from '../../../core/auth/auth.guard';

export const SFA_ROUTES: Routes = [
    { path: 'accounts', children: ACCOUNTS_ROUTES, canActivate: [authGuard] },
];
