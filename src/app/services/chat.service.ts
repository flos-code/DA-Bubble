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

  /**
   * Sets the active channel ID, resets the selected user ID to null, and triggers the loading of threads for the newly active channel.
   * It also updates observers about the change in the active channel ID.
   *
   * @param {string} channelId - The ID of the channel to be set as active.
   */
  setActiveChannelId(channelId: string) {
    this.activeChannelId = channelId;
    this.selectedUserId = null;
    this.activeChannelIdUpdated.next(channelId);
    this.loadThreads(channelId);
  }

  getActiveChannelId(): string {
    return this.activeChannelId;
  }

  /**
   * Sets the selected user ID for direct messages, resets the active channel ID to null, and notifies observers about the change in the active user ID.
   *
   * @param {string} userId - The ID of the user to set as selected for direct messaging.
   */
  setSelectedUserId(userId: string) {
    this.selectedUserId = userId;
    this.activeChannelId = null;
    this.activeUserIdUpdated.next(userId);
  }

  getSelectedUserId(): string {
    return this.selectedUserId;
  }

  // ------------------- MainChat Logic --------------------

  /**
   * Fetches and returns a list of threads for a given channel ID from Firestore.
   * Each thread is transformed into a `Thread` class instance before being returned.
   *
   * @param {string} channelId - The ID of the channel for which to fetch threads.
   * @returns {Promise<Thread[]>} A promise that resolves to an array of `Thread` instances.
   */
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

  /**
   * Loads threads for a specified channel ID and updates the BehaviorSubject holding the current threads.
   *
   * @param {string} channelId - The ID of the channel for which to load threads.
   */
  async loadThreads(channelId: string): Promise<void> {
    const threads = await this.getThreads(channelId);
    this.threadsSource.next(threads);
  }

  // ------------------- SecondaryChat Logic --------------------

  /**
   * Opens a thread by setting the thread open state to false initially, updating the selected thread ID, and then setting the thread open state to true shortly after.
   * This approach allows for any necessary animations or UI updates when opening a thread.
   *
   * @param {string} threadId - The ID of the thread to open.
   */
  openThread(threadId: string) {
    this.threadOpenSource.next(false);
    this.selectedThreadIdSource.next(threadId);
    setTimeout(() => {
      this.threadOpenSource.next(true);
    }, 30);
  }

  /**
   * Closes the currently open thread by resetting the selected thread ID and setting the thread open state to false.
   */
  closeThread(): void {
    this.selectedThreadIdSource.next(null);
    this.threadOpenSource.next(false);
  }

  // ------------------- Channel creation Logic --------------------

  /**
   * Checks if a channel name already exists in the Firestore database.
   *
   * @param {string} channelName - The name of the channel to check for existence.
   * @returns {Promise<boolean>} A promise that resolves to `true` if the channel name exists, otherwise `false`.
   */
  async channelNameExists(channelName: string): Promise<boolean> {
    const channelsRef = collection(this.firestore, 'channels');
    const snapshot = await getDocs(channelsRef);
    const channelExists = snapshot.docs.some(
      (doc) => doc.data()['name'] === channelName
    );
    return channelExists;
  }
}
