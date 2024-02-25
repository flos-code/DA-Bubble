import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { initializeApp } from "firebase/app";
import { Message } from '../../models/message.class';
import { getFirestore, collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, getDocs, getDoc } from "firebase/firestore";
import { ThreadMessage } from '../../models/threadMessage.class';
import { Thread } from '../../models/thread.class';

const firebaseConfig = {
  apiKey: "AIzaSyC520Za3P8qTUGvWM0KxuYqGIMaz-Vd48k",
  authDomain: "da-bubble-87fea.firebaseapp.com",
  projectId: "da-bubble-87fea",
  storageBucket: "da-bubble-87fea.appspot.com",
  messagingSenderId: "970901942782",
  appId: "1:970901942782:web:56b67253649b6206f290af"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private messages = [];
  private db;
  private threadOpenSource = new BehaviorSubject<boolean>(false);
  threadOpen$ = this.threadOpenSource.asObservable();

  private activeChannelId: string;

  constructor() {
  }

  openThread(): void {
    this.threadOpenSource.next(true);
  }

  closeThread(): void {
    this.threadOpenSource.next(false);
  }

  setActiveChannelId(channelId: string) {
    this.activeChannelId = channelId;
    console.log(`Aktiver Channel: ${this.activeChannelId}`);
  }

  getActiveChannelId(): string {
    return this.activeChannelId;
  }

  async getThreads(channelId): Promise<Thread[]> {
    const threadsRef = collection(db, `channels/${channelId}/threads`);
    const snapshot = await getDocs(threadsRef);
    const threads: Thread[] = snapshot.docs.map(doc => new Thread({ ...doc.data(), threadId: doc.id }));
    
    console.log("Geladene Threads:", threads);
    return threads;
  }
  
}
