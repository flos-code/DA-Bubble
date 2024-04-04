import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment.development';

const firebaseConfig = {
  apiKey: 'AIzaSyAPsKx6zIbKLO9wCKMjo74vtgPgdCMCVfU',
  authDomain: 'da-bubble-5dd4b.firebaseapp.com',
  projectId: 'da-bubble-5dd4b',
  storageBucket: 'da-bubble-5dd4b.appspot.com',
  messagingSenderId: '102602206731',
  appId: '1:102602206731:web:96e14d64cf36fef837210e',
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    importProvidersFrom([
      provideFirebaseApp(() => initializeApp(firebaseConfig)),
      provideStorage(() => getStorage()),
      provideFirestore(() => getFirestore()),
    ]),
  ],
};
