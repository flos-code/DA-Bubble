import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { initializeApp } from "firebase/app";
import { Message } from '../../models/message.class';
import { getFirestore, collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";

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
    const firebaseConfig = {
      apiKey: "AIzaSyC520Za3P8qTUGvWM0KxuYqGIMaz-Vd48k",
      authDomain: "da-bubble-87fea.firebaseapp.com",
      projectId: "da-bubble-87fea",
      storageBucket: "da-bubble-87fea.appspot.com",
      messagingSenderId: "970901942782",
      appId: "1:970901942782:web:56b67253649b6206f290af"
    };
    const app = initializeApp(firebaseConfig);
    this.db = getFirestore(app);
  }

  listenForMessages(channelId: string) {
    const messagesRef = collection(this.db, `channels/${this.activeChannelId}/messages`);
    onSnapshot(messagesRef, (snapshot) => {
      const messages = snapshot.docs.map(doc => new Message({ ...doc.data(), messageId: doc.id }));
    });
  }

  async addMessage(channelId: string, message: Message) {
    const messagesRef = collection(this.db, `channels/${this.activeChannelId}/messages`);
    await addDoc(messagesRef, message.toJSON());
  }

  async updateMessage(channelId: string, message: Message) {
    const messageRef = doc(this.db, `channels/${this.activeChannelId}/messages/${message.messageId}`);
    await updateDoc(messageRef, message.toJSON());
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
}
