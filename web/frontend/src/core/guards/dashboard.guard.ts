import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';

import { DashboardPageManagerService } from '../services/dashboard-page-manager.service';

/**
 * A guard function that determines whether a user is allowed to access the dashboard page.
 * @param route - The current route being navigated to.
 * @param state - The current state of the router.
 * @returns An Observable that emits a boolean value indicating whether the user is allowed to access the dashboard page.
 */
export const dashboardGuard: CanActivateFn = (route, state) => {
  const dashboardPageManagerService = inject(DashboardPageManagerService);
  const router: Router = inject(Router);

  return dashboardPageManagerService.getPageNames$().pipe(
    take(1),
    map((pages) => {
      if (pages.includes(route.params['page'])) {
        return true;
      } else {
        router.navigate(['/dashboard']);
        return false;
      }
    })
  );
};
