import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    importProvidersFrom(
      provideFirebaseApp(() =>
        initializeApp({
          projectId: 'tidetweetmetrics-a047f',
          appId: '1:376861563223:web:50a529a1e2c3cb92d2c612',
          storageBucket: 'tidetweetmetrics-a047f.appspot.com',
          apiKey: 'AIzaSyBrxP5MKlLCgO7beiII3sIVb2nMsay5TSg',
          authDomain: 'tidetweetmetrics-a047f.firebaseapp.com',
          messagingSenderId: '376861563223',
          measurementId: 'G-MEND79FYZ2',
        })
      )
    ),
    importProvidersFrom(provideAuth(() => getAuth())),
    importProvidersFrom(provideFirestore(() => getFirestore())),
    importProvidersFrom(provideStorage(() => getStorage())), provideAnimationsAsync(),
  ],
};
