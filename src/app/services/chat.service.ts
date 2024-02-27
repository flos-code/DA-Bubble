import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { initializeApp } from 'firebase/app';
import { Message } from '../../models/message.class';
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
} from 'firebase/firestore';
import { ThreadMessage } from '../../models/threadMessage.class';
import { Thread } from '../../models/thread.class';

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
export class ChatService {
  private messages = [];
  private db;
  private threadOpenSource = new BehaviorSubject<boolean>(false);
  threadOpen$ = this.threadOpenSource.asObservable();
  private threadsSource = new BehaviorSubject<Thread[]>([]);
  threads$ = this.threadsSource.asObservable();
  private selectedThreadIdSource = new BehaviorSubject<string | null>(null);
  selectedThreadId$ = this.selectedThreadIdSource.asObservable();

  private activeChannelId: string;
  private selectedUserId: string;

  private activeChannelIdUpdated = new BehaviorSubject<string | null>(null);
  get activeChannelIdUpdates() {
    return this.activeChannelIdUpdated.asObservable();
  }

  constructor() {}

  // ------------------- Channel Logic --------------------

  setActiveChannelId(channelId: string) {
    this.activeChannelId = channelId;
    this.selectedUserId = null;
    this.activeChannelIdUpdated.next(channelId);
    this.loadThreads(channelId);
    // console.log(`Aktiver Channel: ${this.activeChannelId}`);
  }

  getActiveChannelId(): string {
    return this.activeChannelId;
  }

  setSelectedUserId(userId: string) {
    this.selectedUserId = userId;
    this.activeChannelId = null;
    // console.log(`Ausgewählter User: ${this.selectedUserId}`);
  }

  getSelectedUserId(): string {
    return this.selectedUserId;
  }

  // ------------------- MainChat Logic --------------------

  async getThreads(channelId): Promise<Thread[]> {
    const threadsRef = collection(db, `channels/${channelId}/threads`);
    const snapshot = await getDocs(threadsRef);
    const threads: Thread[] = snapshot.docs.map(
      (doc) => new Thread({ ...doc.data(), threadId: doc.id })
    );

    console.log('Geladene Threads:', threads);
    return threads;
  }

  async loadThreads(channelId: string): Promise<void> {
    const threads = await this.getThreads(channelId);
    this.threadsSource.next(threads);
  }

  // ------------------- SecondaryChat Logic --------------------

  openThread(threadId: string): void {
    this.selectedThreadIdSource.next(threadId);
    this.threadOpenSource.next(true);
  }

  closeThread(): void {
    this.selectedThreadIdSource.next(null);
    this.threadOpenSource.next(false);
  }

  async getThreadMessages(channelId: string, threadId: string): Promise<ThreadMessage[]> {
    const threadMessagesRef = collection(db, `channels/${channelId}/threads/${threadId}/messages`);
    const snapshot = await getDocs(threadMessagesRef);
    
    // Log the raw snapshot data
    console.log("Snapshot data:", snapshot.docs.map(doc => doc.data()));
    
    // Process and log the processed ThreadMessage objects
    const threadMessages = snapshot.docs.map(
      (doc) => new ThreadMessage({ ...doc.data(), messageId: doc.id })
    );
    console.log("Processed ThreadMessages:", threadMessages);
    console.log('threadId:', threadId,'channelId:', channelId)
    
    return threadMessages;
  }
  

  async updateThreadMessage(
    channelId: string,
    threadId: string,
    messageId: string,
    updates: any
  ) {
    const messageDocRef = doc(
      db,
      `channels/${channelId}/threads/${threadId}/messages/${messageId}`
    );
    await updateDoc(messageDocRef, updates);
  }

  async addThreadMessage(
    channelId: string,
    threadId: string,
    threadMessage: ThreadMessage
  ) {
    const threadMessagesRef = collection(
      db,
      `channels/${channelId}/threads/${threadId}/messages`
    );
    await addDoc(threadMessagesRef, threadMessage.toJSON());
  }

  async deleteThreadMessage(
    channelId: string,
    threadId: string,
    messageId: string
  ) {
    const messageDocRef = doc(
      db,
      `channels/${channelId}/threads/${threadId}/messages/${messageId}`
    );
    await deleteDoc(messageDocRef);
  }
}
