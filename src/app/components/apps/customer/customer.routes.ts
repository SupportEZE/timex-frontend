


import { Routes } from '@angular/router';
import { authGuard } from '../../../core/auth/auth.guard';
import { CUSTOMER_CHILD_ROUTES } from './customer-child.routes';

export const CUSTOMER_ROUTES: Routes = [
  {
    path: 'customer-list/:login_type_id/:login_type_name', children: CUSTOMER_CHILD_ROUTES, canActivate: [authGuard]
  },
]

