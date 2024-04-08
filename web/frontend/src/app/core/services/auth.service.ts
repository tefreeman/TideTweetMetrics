import { Storage, ref, getDownloadURL } from '@angular/fire/storage';
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
  user,
} from '@angular/fire/auth';

import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { GraphService, Metrics } from './graph.service';

@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy{

  //TODO - DON"T FORGET TO RECONFIG CORS FOR STORAGE BUCKET
  // IT"S SET TO ALLOW ALL VERY INSECURE
  private _storage = inject(Storage);
  private _auth = inject(Auth);
  private httpclient = inject(HttpClient);
  private _graphService = inject(GraphService);

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
  signout(): void {
    signOut(this._auth).then(() => {
      this.router.navigate(['/']);
    });
  }

  getChartData(): void {
    console.log('getting chart data')
    getDownloadURL(ref(this._storage, 'ex_metric_out.json')).then((url) => {
      this.httpclient.get<Metrics>(url).subscribe((data) => {
        console.log("fired!", data);
        this._graphService.setMetrics(data);
      });
  });
}
  ngOnDestroy() {
    // when manually subscribing to an observable remember to unsubscribe in ngOnDestroy

  }
}
