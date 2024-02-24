import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { initializeApp } from "firebase/app";
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
    this.listenForMessages();
  }

  private listenForMessages() {
    const messagesRef = collection(this.db, 'messages');
    onSnapshot(messagesRef, (snapshot) => {
      this.messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    });
  }

  getMessages() {
    return this.messages;
  }

  async addMessage(message) {
    const messagesRef = collection(this.db, 'messages');
    await addDoc(messagesRef, message);
  }

  async updateMessage(id, updatedFields) {
    const messageRef = doc(this.db, 'messages', id);
    await updateDoc(messageRef, updatedFields);
  }

  async deleteMessage(id) {
    const messageRef = doc(this.db, 'messages', id);
    await deleteDoc(messageRef);
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
