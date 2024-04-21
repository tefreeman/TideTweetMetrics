import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';

import { DashboardPageManagerService } from '../services/dashboard-page-manager.service';

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
