


import { Routes } from '@angular/router';
import { authGuard } from '../../../core/auth/auth.guard';
import { SITE_CHILD_ROUTES } from './site-child.routes';

export const SITE_ROUTES: Routes = [
  {
    path: 'site-list/:login_type_id/:login_type_name', children: SITE_CHILD_ROUTES, canActivate: [authGuard]
  },
]

