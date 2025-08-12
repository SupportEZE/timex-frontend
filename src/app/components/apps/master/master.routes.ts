import { Routes } from '@angular/router';
import { PRODUCT_ROUTES } from './product/product.routes';
import { USER_ROUTES } from './user/user.routes';
import { ROLE_ROUTES } from './role-and-permission/role.routes';
import { authGuard } from '../../../core/auth/auth.guard';
import { REPORT_ROUTES } from './report/report.routes';
// import { WARRANTY_ROUTES } from './warranty/warranty.routes';
export const MASTER_ROUTES: Routes = [
  { path: 'products-list', children: PRODUCT_ROUTES , canActivate: [authGuard]  },
  { path: 'user', children: USER_ROUTES, canActivate: [authGuard] },
  // { path: 'warranty', children: WARRANTY_ROUTES, canActivate: [authGuard] },
  { path: 'role-and-permission-list', children: ROLE_ROUTES, canActivate: [authGuard] },
  { path: 'report', children: REPORT_ROUTES, canActivate: [authGuard] },
];
