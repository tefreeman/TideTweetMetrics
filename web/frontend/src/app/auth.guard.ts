import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateFn, Router  } from '@angular/router';
import { AuthService } from './auth.service';
import { inject, Injectable } from '@angular/core';
import { map, Observable, take, tap } from 'rxjs';


export const AuthGuard: CanActivateFn = (route, state) => {
  const authService: AuthService = inject(AuthService);
  const router: Router = inject(Router);

  return authService.authState$.pipe(
    take(1), // Take only the first emission from the observable and complete
    map(authState => !!authState), // Map the authState to true if it exists, otherwise false
    tap(isAuthenticated => {
      if (!isAuthenticated) {
        router.navigate(['/login']); // Redirect to login if not authenticated
      }
    })
  );
};

