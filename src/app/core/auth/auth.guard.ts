// auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { ModuleService } from '../../shared/services/module.service';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const moduleService = inject(ModuleService);
  const router = inject(Router);
  if (!authService.isLoggedIn()) {
    router.navigate(['/auth/login']);
    return false;
  }


  return true;


  // const allowedPaths = moduleService.getAllowedPaths();
  // const currentPath = state.url.split('?')[0]
  // const matched = allowedPaths.some(base =>
  //   currentPath === base || currentPath.startsWith(base + '/')
  // );if (matched) {
  //   return true;
  // } else {
  //   router.navigate(['/auth/login']);
  //   return false;
  // }

  // 
};
