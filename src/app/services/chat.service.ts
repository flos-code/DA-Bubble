import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { Thread } from '../../models/thread.class';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private activeChannelId: string;
  private selectedUserId: string;
  private firestore: Firestore = inject(Firestore);

  private threadOpenSource = new BehaviorSubject<boolean>(false);
  threadOpen$ = this.threadOpenSource.asObservable();

  private threadsSource = new BehaviorSubject<Thread[]>([]);
  threads$ = this.threadsSource.asObservable();

  private selectedThreadIdSource = new BehaviorSubject<string | null>(null);
  selectedThreadId$ = this.selectedThreadIdSource.asObservable();

  private activeChannelIdUpdated = new BehaviorSubject<string | null>(null);

  get activeChannelIdUpdates() {
    return this.activeChannelIdUpdated.asObservable();
  }

  private activeUserIdUpdated = new BehaviorSubject<string | null>(null);
  get activeUserIdUpdates() {
    return this.activeUserIdUpdated.asObservable();
  }

  constructor() {}

  // ------------------- Channel Logic --------------------

  setActiveChannelId(channelId: string) {
    this.activeChannelId = channelId;
    this.selectedUserId = null;
    this.activeChannelIdUpdated.next(channelId);
    this.loadThreads(channelId);
  }

  getActiveChannelId(): string {
    return this.activeChannelId;
  }

  setSelectedUserId(userId: string) {
    this.selectedUserId = userId;
    this.activeChannelId = null;
    this.activeUserIdUpdated.next(userId);
  }

  getSelectedUserId(): string {
    return this.selectedUserId;
  }

  // ------------------- MainChat Logic --------------------

  async getThreads(channelId): Promise<Thread[]> {
    const threadsRef = collection(
      this.firestore,
      `channels/${channelId}/threads`
    );
    const snapshot = await getDocs(threadsRef);
    const threads: Thread[] = snapshot.docs.map(
      (doc) => new Thread({ ...doc.data(), threadId: doc.id })
    );
    return threads;
  }

  async loadThreads(channelId: string): Promise<void> {
    const threads = await this.getThreads(channelId);
    this.threadsSource.next(threads);
  }

  // ------------------- SecondaryChat Logic --------------------

  openThread(threadId: string) {
    this.threadOpenSource.next(false);
    this.selectedThreadIdSource.next(threadId);
    setTimeout(() => {
      this.threadOpenSource.next(true);
    }, 30);
  }

  closeThread(): void {
    this.selectedThreadIdSource.next(null);
    this.threadOpenSource.next(false);
  }

  // ------------------- Channel creation Logic --------------------

  async channelNameExists(channelName: string): Promise<boolean> {
    const channelsRef = collection(this.firestore, 'channels');
    const snapshot = await getDocs(channelsRef);
    const channelExists = snapshot.docs.some(
      (doc) => doc.data()['name'] === channelName
    );
    return channelExists;
  }
}
