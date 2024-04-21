import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

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
