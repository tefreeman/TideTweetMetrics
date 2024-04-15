import { inject, Injectable, OnDestroy } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, setDoc} from '@angular/fire/firestore';
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
import { from, map, Observable, of, switchMap } from 'rxjs';
import { I_FileVersion, I_Profile } from '../interfaces/profile-interface';



@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy{

  //TODO - DON"T FORGET TO RECONFIG CORS FOR STORAGE BUCKET
  // IT"S SET TO ALLOW ALL VERY INSECURE
  private _auth = inject(Auth);
  private _firestore: Firestore = inject(Firestore);

  authState$ = authState(this._auth);
  user$ = user(this._auth);
  idToken$ = idToken(this._auth);

  constructor(private router: Router) {
  }


  getFileVersion(file_id: string): Observable<I_FileVersion | null> {
    if (!file_id) {
      throw new Error('Invalid file ID');
    }
    return <Observable<I_FileVersion | null>>this.user$.pipe(
      switchMap((user) => {
        if (!user) {
          // If there's no user, return an observable that emits null
          return of(null);
        }
        const userDocRef = doc(this._firestore, `file_versions/${file_id}`);
        return docData(userDocRef, { idField: 'id' });
      })
    );
  }

  getProfileDoc(): Observable<I_Profile | null> {
    return <Observable<I_Profile | null>>this.user$.pipe(
      switchMap((user) => {
        if (!user) {
          // If there's no user, return an observable that emits null
          return of(null);
        }
        const userDocRef = doc(this._firestore, `profiles/${user.uid}`);
        return docData(userDocRef, { idField: 'id' });
      })
    );
  }

  setProfileDoc(userData: any): Observable<void> {
    return this.user$.pipe(
      switchMap((user) => {
        if (!user) {
          // If there's no user, throw an error or handle it as you see fit
          throw new Error('No authenticated user. Cannot set user document.');
        }
        const userDocRef = doc(this._firestore, `profiles/${user.uid}`)

        // Convert the Firestore set operation (a Promise) into an Observable
        return from(setDoc(userDocRef, userData, { merge: true })).pipe(map(() => undefined))
      })
    );
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

  ngOnDestroy() {
    // when manually subscribing to an observable remember to unsubscribe in ngOnDestroy

  }
}
