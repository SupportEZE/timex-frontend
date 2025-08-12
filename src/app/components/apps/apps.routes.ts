import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MASTER_ROUTES } from './master/master.routes';
import { SFA_ROUTES } from './sfa/sfa.routes';
import { CUSTOMER_ROUTES } from './customer/customer.routes';
import { AUTHENTICATION_ROUTES } from '../../authentication/authentication.route';
import { SERVICE_ROUTES } from './service/service.routes';
import { authGuard } from '../../core/auth/auth.guard';
import { SITE_ROUTES } from './site/site.routes';

export const admin: Routes = [
    {
        path: 'apps',
        children: [
            { path: 'master', children: MASTER_ROUTES, canActivate: [authGuard] },
            { path: 'customer', children: CUSTOMER_ROUTES, canActivate: [authGuard] },
            { path: 'site', children: SITE_ROUTES, canActivate: [authGuard] },
            { path: 'sfa', children: SFA_ROUTES, canActivate: [authGuard] },
            { path: 'service', children: SERVICE_ROUTES, canActivate: [authGuard] },
            { path: 'authentication', children: AUTHENTICATION_ROUTES, canActivate: [authGuard] },
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(admin)],
    exports: [RouterModule],
})
export class appsRoutingModule {
    static routes = admin;
}