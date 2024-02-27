import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { collection, getFirestore, onSnapshot } from 'firebase/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../../models/user.class';

const firebaseConfig = {
  apiKey: 'AIzaSyC520Za3P8qTUGvWM0KxuYqGIMaz-Vd48k',
  authDomain: 'da-bubble-87fea.firebaseapp.com',
  projectId: 'da-bubble-87fea',
  storageBucket: 'da-bubble-87fea.appspot.com',
  messagingSenderId: '970901942782',
  appId: '1:970901942782:web:56b67253649b6206f290af',
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

@Injectable({
  providedIn: 'root',
})
export class UserManagementService {
  authSubscription: any;
  auth = getAuth(app);

  private activeUserId = new BehaviorSubject<string | null>(null);
  public activeUserId$ = this.activeUserId.asObservable();

  private users = new BehaviorSubject<{ id: string; data: User }[]>([]);
  public users$: Observable<{ id: string; data: User }[]> =
    this.users.asObservable();

  constructor() {
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.activeUserId.next(user.uid);
      } else {
        // when no one is logged in guest id
        this.activeUserId.next('Yic168FhfjbDhxyTsATeQttU3xD2');
      }
    });
  }

  loadUsers(): void {
    const usersCol = collection(db, 'users');
    onSnapshot(usersCol, (snapshot) => {
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        data: new User(doc.data()),
      }));
      this.sortUsers(users); // Sortieren der Benutzer bevor sie im BehaviorSubject aktualisiert werden
      this.users.next(users); // Aktualisieren des BehaviorSubject
    });
  }

  sortUsers(users: { id: string; data: User }[]): void {
    users.sort((a, b) => {
      if (a.id === this.activeUserId.value) return -1;
      if (b.id === this.activeUserId.value) return 1;
      return 0;
    });
  }
}
