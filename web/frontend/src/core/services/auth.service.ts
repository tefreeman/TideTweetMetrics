import { inject, Injectable } from '@angular/core';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  idToken,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  user,
  UserCredential,
} from '@angular/fire/auth';
import { doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';

import { Router } from '@angular/router';
import {
  catchError,
  from,
  map,
  Observable,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import {
  I_FileVersion,
  I_Profile,
  I_UserAndRole,
} from '../interfaces/profile-interface';

/**
 * Service responsible for handling authentication-related operations.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  //TODO - DON"T FORGET TO RECONFIG CORS FOR STORAGE BUCKET
  // IT"S SET TO ALLOW ALL VERY INSECURE

  /**
   * Injected instance of the Auth service.
   */
  private _auth = inject(Auth);

  /**
   * Injected instance of the Firestore service.
   */
  private _firestore: Firestore = inject(Firestore);

  /**
   * Injected instance of the Functions service.
   */
  private _functions = inject(Functions);

  /**
   * Observable representing the authentication state.
   */
  authState$ = authState(this._auth);

  /**
   * Observable representing the currently signed-in user.
   */
  user$ = user(this._auth);

  /**
   * Observable representing the ID token of the currently signed-in user.
   */
  idToken$ = idToken(this._auth);

  // TODO: REMOVE INIT
  /**
   * The college/twitter-handle of the user.
   */
  userCollege: string = 'alabama_cs';

  /**
   * Constructs a new AuthService instance.
   * @param router - The router service.
   */
  constructor(private router: Router) { }

  /**
   * Retrieves all users with their roles from the server.
   * @returns An observable that emits an array of users with their roles.
   */
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

  /**
   * Updates the role of a user.
   * @param uid - The ID of the user.
   * @returns An observable that emits a boolean indicating the success of the operation.
   */
  updateUserRole$(uid: string): Observable<boolean> {
    // Create a callable function reference
    const callable = httpsCallable(this._functions, 'updateUserRole');
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

  /**
   * Deletes a user and their profile.
   * @param uid - The ID of the user.
   * @returns An observable that emits a boolean indicating the success of the operation.
   */
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

  /**
   * Checks if the currently signed-in user is an admin.
   * @returns An observable that emits a boolean indicating if the user is an admin.
   */
  isAdmin$(): Observable<boolean> {
    return this.authState$.pipe(
      switchMap(async (authState) => {
        if (!authState) {
          return false;
        }
        const token = await authState.getIdTokenResult();
        return token.claims['role'] === 'admin';
      }),
      map((isAdmin) => isAdmin)
    );
  }

  /**
   * Retrieves the version of a file.
   * @param file_id - The ID of the file.
   * @returns An observable that emits the file version or null if the file does not exist.
   * @throws Error if the file ID is invalid.
   */
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

  /**
   * Retrieves the profile document of the currently signed-in user.
   * @returns An observable that emits the profile document or null if the user is not signed in.
   */
  getProfileDoc(): Observable<I_Profile | null> {
    return this.user$.pipe(
      switchMap((user) => {
        if (!user) {
          // If there's no user, then immediately return an observable of null
          return of(null);
        }
        const userDocRef = doc(this._firestore, `profiles/${user.uid}`);
        // Specify the expected return type directly within docData's call
        return docData(userDocRef, { idField: 'id' }) as Observable<I_Profile>;
      }),
      tap((profile) => {
        if (profile) {
          // TODO: FIX THIS
          //  this.userCollege = profile.defaultCollege || '';
        }
      })
    );
  }

  /**
   * Sets the profile document of the currently signed-in user.
   * @param userData - The data to be set in the profile document.
   * @returns An observable that emits void when the operation is complete.
   * @throws Error if there is no authenticated user.
   */
  setProfileDoc(userData: any): Observable<void> {
    return this.user$.pipe(
      switchMap((user) => {
        if (!user) {
          // If there's no user, throw an error or handle it as you see fit
          throw new Error('No authenticated user. Cannot set user document.');
        }
        const userDocRef = doc(this._firestore, `profiles/${user.uid}`);

        // Convert the Firestore set operation (a Promise) into an Observable
        return from(setDoc(userDocRef, userData)).pipe(
          map(() => undefined)
        );
      })
    );
  }

  /**
   * Signs up a new user with the provided email and password.
   * @param email - The email of the user.
   * @param password - The password of the user.
   * @returns A promise that resolves to the user credential.
   */
  signup(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(
      this._auth,
      email.trim(),
      password.trim()
    );
  }

  /**
   * Logs in a user with the provided email and password.
   * @param email - The email of the user.
   * @param password - The password of the user.
   * @returns A promise that resolves to the user credential.
   */
  login(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(
      this._auth,
      email.trim(),
      password.trim()
    );
  }

  /**
   * Signs out the currently signed-in user.
   */
  signout(): void {
    signOut(this._auth).then(() => {
      this.router.navigate(['/']);
    });
  }

  /**
   * Navigates to the home page.
   */
  goHome(): void {
    this.router.navigate(['/']);
  }

  /**
   * Sends a password reset email to the currently signed-in user.
   * @returns A promise that resolves when the email is sent.
   * @throws Error if there is no authenticated user or the user does not have an email.
   */
  sendPasswordResetEmailCurrentUser(): Promise<void> | never {
    // Attempt to retrieve the currently signed-in user
    const user = this._auth.currentUser;

    // Check if a user is signed in
    if (user && user.email) {
      // Use the email of the currently signed-in user to send a password reset email
      return sendPasswordResetEmail(this._auth, user.email);
    } else {
      // Throw an error if there is no user signed in, or the user does not have an email
      throw new Error(
        'No authenticated user with an email found. Cannot send password reset email.'
      );
    }
  }
}
