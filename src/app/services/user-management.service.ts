import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  collection,
  getDocs,
  getFirestore,
  onSnapshot,
} from 'firebase/firestore';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
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

  public activeUserId = new BehaviorSubject<string | null>(null);
  public activeUserId$ = this.activeUserId.asObservable();

  private users = new BehaviorSubject<{ id: string; data: User }[]>([]);
  public users$: Observable<{ id: string; data: User }[]> =
    this.users.asObservable();

  private updatedUserIds = new BehaviorSubject<string[]>([]);

  public filteredUsers$: Observable<{ id: string; data: User }[]> =
    combineLatest([this.users$, this.updatedUserIds]).pipe(
      map(([users, updatedIds]) => {
        const filtered = users.filter((user) => updatedIds.includes(user.id));
        const sortedFilteredUsers = filtered.sort((a, b) => {
          if (a.id === this.activeUserId.value) return -1;
          if (b.id === this.activeUserId.value) return 1;
          return 0;
        });
        return sortedFilteredUsers;
      })
    );

  constructor() {
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.activeUserId.next(user.uid);
      } else {
        // when no one is logged in guest id
        // this.activeUserId.next('Yic168FhfjbDhxyTsATeQttU3xD2');
      }
    });
  }

  async loadUsers() {
    const usersCol = collection(db, 'users');
    onSnapshot(usersCol, async (snapshot) => {
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        data: new User(doc.data()),
      }));
      this.sortUsers(users); // Sortieren der Benutzer bevor sie im BehaviorSubject aktualisiert werden
      this.users.next(users); // Aktualisieren des BehaviorSubject

      await this.addActiveUserIdAndFetchUserIds();
    });
  }

  sortUsers(users: { id: string; data: User }[]): void {
    users.sort((a, b) => {
      if (a.id === this.activeUserId.value) return -1;
      if (b.id === this.activeUserId.value) return 1;
      return 0;
    });
  }

  getActiveUserId() {
    return this.activeUserId;
  }

  async getDirectMessageUserIds(): Promise<string[]> {
    if (!this.activeUserId.value) {
      // Kein aktiver Benutzer, leer zurückgeben
      return [];
    }

    try {
      const dmCollectionRef = collection(
        getFirestore(),
        `users/${this.activeUserId.value}/allDirectMessages`
      );
      const snapshot = await getDocs(dmCollectionRef);
      const userIds = snapshot.docs.map((doc) => doc.id);
      console.log('Direktnachrichten-Partner-IDs:', userIds);
      return userIds;
    } catch (error) {
      console.error(
        'Fehler beim Abrufen der Direktnachrichten-Partner-IDs:',
        error
      );
      return []; // Im Fehlerfall ein leeres Array zurückgeben
    }
  }

  ensureActiveUserIdIncluded(userIds: string[]): string[] {
    if (!userIds.includes(this.activeUserId.value)) {
      userIds.push(this.activeUserId.value);
    }
    return userIds;
  }

  async addActiveUserIdAndFetchUserIds() {
    try {
      const dmUserIds = await this.getDirectMessageUserIds();
      const updatedUserIds = this.ensureActiveUserIdIncluded(dmUserIds);
      this.updatedUserIds.next(updatedUserIds); // Aktualisiere das BehaviorSubject
    } catch (error) {
      console.error(
        'Fehler beim Abrufen oder Aktualisieren der Benutzer-IDs:',
        error
      );
    }
  }
}
