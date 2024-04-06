import { inject, Injectable, OnDestroy } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  authState,
  idToken,
  user
} from '@angular/fire/auth';

import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy{

  private _auth = inject(Auth);


  authState$ = authState(this._auth);
  user$ = user(this._auth);
  idToken$ = idToken(this._auth);

  constructor(private router: Router) {
  }

  signup(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(
      this._auth,
      email.trim(),
      password.trim()
    );
  }

  login(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(
        this._auth,
        email.trim(),
        password.trim()
      );
    }
  signout(): Promise<void> {
    return signOut(this._auth);
  }

  ngOnDestroy() {
    // when manually subscribing to an observable remember to unsubscribe in ngOnDestroy
    
  }
}
