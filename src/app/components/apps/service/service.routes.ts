import { Routes } from '@angular/router';
import { WARRANTY_ROUTES } from './warranty-registration/warranty.routes';
import { authGuard } from '../../../core/auth/auth.guard';

export const SERVICE_ROUTES: Routes = [
    { path: 'warranty-registration', children: WARRANTY_ROUTES, canActivate: [authGuard]  },
];
