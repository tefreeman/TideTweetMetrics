import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';
import { inject } from '@angular/core';

export const startGuard: CanActivateFn = (route, state) => {
  const authService: AuthService = inject(AuthService);
  const router: Router = inject(Router);

  return authService.getProfileDoc().pipe(take(1), map((profile) => {
    if (profile) {
      return Object.keys(profile).length !== 0
    } else {
      router.navigate(['/dashboard/start']);
      return false;
    }
  }))
};
