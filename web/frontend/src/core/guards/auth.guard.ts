import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { switchMap, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

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
