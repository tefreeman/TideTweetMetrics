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
  sendPasswordResetEmail
} from '@angular/fire/auth';
import {Functions, httpsCallable} from '@angular/fire/functions';

import { Router } from '@angular/router';
import { catchError, from, map, Observable, of, switchMap, throwError } from 'rxjs';
import { I_FileVersion, I_Profile, I_UserAndRole } from '../interfaces/profile-interface';



@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy{

  //TODO - DON"T FORGET TO RECONFIG CORS FOR STORAGE BUCKET
  // IT"S SET TO ALLOW ALL VERY INSECURE
  private _auth = inject(Auth);
  private _firestore: Firestore = inject(Firestore);
  private _functions = inject(Functions);

  authState$ = authState(this._auth);
  user$ = user(this._auth);
  idToken$ = idToken(this._auth);

  constructor(private router: Router) {
  }



  adminGetAllUsersWithRoles$(): Observable<I_UserAndRole[]> {
    // Create a callable function reference
    const callable = httpsCallable(this._functions, 'getAllUsersWithRoles');
    return from(callable()).pipe(
      map((result) => {
        // Read result of the Cloud Function.
        console.log(result.data);
        return result.data as I_UserAndRole[]; 
      }),
      catchError((error) => {
        console.error('Error calling function:', error);
        return throwError(error); // or return an empty array, etc., depending on your needs
      })
    );
  }

  deleteUserAndProfile$(uid: string): Observable<boolean> {
    // Create a callable function reference
    const callable = httpsCallable(this._functions, 'deleteUserAndProfile');
    return from(callable({ uid })).pipe(
      map((result) => {
        // Read result of the Cloud Function.
        console.log(result.data);
        return true; 
      }),
      catchError((error) => {
        console.error('Error calling function:', error);
        return throwError(false); // or return an empty array, etc., depending on your needs
      })
    );
  }
  
  isAdmin$(): Observable<boolean> {
    return this.authState$.pipe(
      switchMap(async (authState) => {
        if (!authState) {
          return false;
        }
        const token = await authState.getIdTokenResult();
        return token.claims['role'] === 'admin'
      }),  
      map(isAdmin => isAdmin)
    );

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

  sendPasswordResetEmailCurrentUser(): Promise<void> | never {
    // Attempt to retrieve the currently signed-in user
    const user = this._auth.currentUser;

    // Check if a user is signed in
    if (user && user.email) {
        // Use the email of the currently signed-in user to send a password reset email
        return sendPasswordResetEmail(this._auth, user.email);
    } else {
        // Throw an error if there is no user signed in, or the user does not have an email
        throw new Error('No authenticated user with an email found. Cannot send password reset email.');
    }
}

  ngOnDestroy() {
    // when manually subscribing to an observable remember to unsubscribe in ngOnDestroy

  }
}
