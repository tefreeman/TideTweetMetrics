import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { switchMap, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * AuthGuard is a function that implements the CanActivateFn interface.
 * It is used as a guard to protect routes that require authentication.
 * If the user is not authenticated or does not have the required role, they will be redirected to the login or unauthorized page.
 *
 * @param route - The activated route snapshot.
 * @param state - The router state snapshot.
 * @returns A boolean or an Observable that resolves to a boolean indicating whether the route can be activated.
 */
export const AuthGuard: CanActivateFn = (route, state) => {
  const authService: AuthService = inject(AuthService);
  const router: Router = inject(Router);

  return authService.authState$.pipe(
    take(1),
    switchMap(async (authState) => {
      if (!authState) {
        // check are user is logged in
        router.navigate(['/login']);
        return false;
      }
      const token = await authState.getIdTokenResult();
      console.log(token.claims['role']);
      if (token.claims['role'] === 'user' || token.claims['role'] === 'admin') {
        // check claims
        return true;
      } else {
        router.navigate(['/unauthorized']);
        return false;
      }
    })
  );
};
