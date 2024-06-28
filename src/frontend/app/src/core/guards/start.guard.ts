import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * A guard that checks if the user is allowed to access the start route.
 * It checks if the user's profile exists and is not empty.
 * If the profile does not exist or is empty, it redirects the user to the start dashboard.
 *
 * @param route - The activated route snapshot.
 * @param state - The router state snapshot.
 * @returns A boolean or an observable that emits a boolean indicating if the user is allowed to access the start route.
 */
export const startGuard: CanActivateFn = (route, state) => {
  const authService: AuthService = inject(AuthService);
  const router: Router = inject(Router);

  return authService.getProfileDoc().pipe(
    take(1),
    map((profile) => {
      if (profile) {
        return Object.keys(profile).length !== 0;
      } else {
        router.navigate(['/dashboard/start']);
        return false;
      }
    })
  );
};
