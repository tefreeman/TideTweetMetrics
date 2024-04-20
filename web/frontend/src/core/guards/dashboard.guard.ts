import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';
import { inject } from '@angular/core';
import { DisplayRequestManagerService } from '../services/display-request-manager.service';

export const dashboardGuard: CanActivateFn = (route, state) => {
  const displayRequestManagerService = inject(DisplayRequestManagerService);
  const router: Router = inject(Router);


  return displayRequestManagerService.getPageNames$().pipe(take(1), map((pages) => {
    if (pages.includes(route.params['page'])) {
      return true;
    } else {
      router.navigate(['/dashboard']);
      return false;
    }
  }));

}
