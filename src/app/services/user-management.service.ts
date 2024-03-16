import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { User } from '../../models/user.class';
import { environment } from '../../environments/environment.development';

const app = initializeApp(environment.firebase);
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
        this.setUserOnlineStatus(user.uid, true);
      } else {
        if (this.activeUserId.value) {
          this.setUserOnlineStatus(this.activeUserId.value, false);
          this.activeUserId.next(null);
        }
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
      this.sortUsers(users);
      this.users.next(users);
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
      return [];
    }
    try {
      const dmCollectionRef = collection(
        getFirestore(),
        `users/${this.activeUserId.value}/allDirectMessages`
      );
      const snapshot = await getDocs(dmCollectionRef);
      const userIds = snapshot.docs.map((doc) => doc.id);
      return userIds;
    } catch (error) {
      console.error(
        'Fehler beim Abrufen der Direktnachrichten-Partner-IDs:',
        error
      );
      return [];
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
      this.updatedUserIds.next(updatedUserIds);
    } catch (error) {
      console.error(
        'Fehler beim Abrufen oder Aktualisieren der Benutzer-IDs:',
        error
      );
    }
  }

  async setUserOnlineStatus(userId: string, isOnline: boolean) {
    const userDocRef = doc(db, 'users', userId);
    try {
      await updateDoc(userDocRef, { isOnline: isOnline });
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Benutzerstatus', error);
    }
  }
}
