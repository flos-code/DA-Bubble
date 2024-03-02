import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent, EmojiEvent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, limit, query, doc, getDoc, updateDoc, addDoc, getDocs, deleteDoc, orderBy, Timestamp } from "firebase/firestore";
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../services/chat.service';
import { InputService } from '../../../services/input.service';
import { ThreadMessage } from '../../../../models/threadMessage.class';
import { Subscription } from 'rxjs';
import { Thread } from '../../../../models/thread.class';
import { Channel } from '../../../../models/channel.class';

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

@Component({
  selector: 'app-secondary-chat',
  standalone: true,
  imports: [PickerComponent, EmojiComponent, CommonModule, FormsModule],
  templateUrl: './secondary-chat.component.html',
  styleUrl: './secondary-chat.component.scss'
})
export class SecondaryChatComponent implements OnInit, OnDestroy {
  @ViewChild('message') messageInput: ElementRef<HTMLInputElement>;
  @ViewChild('emojiPicker') emojiPicker: ElementRef;
  private subscription = new Subscription();
  /*---------- Main Variables -----------*/
  threadMessages: ThreadMessage[] = [];
  firstThreadMessage?: ThreadMessage;
  threadOpen: boolean = true;
  creationDate: Date;
  isLoading: boolean = true;
  /*---------- Emoji Variables -----------*/
  emojiWindowOpen = false;
  messageModel: string = '';
  currentCursorPosition: number = 0;
  /*---------- Debugging and onworking Variables -----------*/
  currentUser: string = 'OS9ntlBZdogfRKDdbni6eZ9yop93'; //TODO: get actual current user
  channel: Channel; // Data of actual channel
  channelMembers = []; // userdata of actual channel members
  activeChannelId: string = '';
  threadId: string = 'qVp8JcXz4ElKbOWPxX7U'; //TODO: get actual thread ID
  DialogRef: any; //unknown variable, maybe delete later

  constructor(
    private chatService: ChatService,
    public inputService: InputService
  ) { }

  ngOnInit(): void {
    this.getActualChannelId();
    this.subcribeThreadId();
    this.getCurrentChannelData();
    this.loadThreadInitMessage();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /*--------------------------------- Overall -----------------------------------*/

  getActualChannelId() {
    this.activeChannelId = this.chatService.getActiveChannelId() || 'allgemein';
    console.log('Actual CHANNEL ID:', this.activeChannelId)
  }

  subcribeThreadId() { //TODO: dont need to subcribe, it can causes performace issues
    this.subscription.add(this.chatService.selectedThreadId$.subscribe(threadId => {
      if (threadId) {
        this.loadThreadMessages(threadId);
      } else {
        console.log('No thread ID available');
      }
    }));
  }

  closeThread(): void {
    this.chatService.closeThread();
  }


  /*--------------------------------- ThreadMessages -----------------------------------*/
  async getThreadMessages(channelId: string, threadId: string): Promise<ThreadMessage[]> {
    const threadMessagesRef = collection(db, `channels/${channelId}/threads/${threadId}/messages`);
    const snapshot = await getDocs(threadMessagesRef);
    const threadMessages = snapshot.docs.map(
      (doc) => new ThreadMessage({ ...doc.data(), messageId: doc.id }))
      .reverse();
    return threadMessages;
  }

  async loadThreadMessages(threadId: string) {
    await this.getThreadMessages(this.activeChannelId, threadId).then(threadMessages => {
      this.threadMessages = threadMessages;
      console.log(this.threadMessages)
    });
  }

  async getInitialThreadMessage(channelId: string, threadId: string): Promise<Thread> {
    const threadRef = doc(db, `channels/${channelId}/threads/${threadId}`);
    const docSnap = await getDoc(threadRef);

    if (docSnap.exists()) {
      const threadData = docSnap.data();
      return new Thread(threadData);
    } else {
      console.log("Kein Thread-Dokument gefunden!");
      return null;
    }
  }

  async loadThreadInitMessage() {
    this.isLoading = true; // Start loading
    this.firstThreadMessage = await this.getInitialThreadMessage(this.activeChannelId, this.threadId);
    console.log('first Thread Message:', this.firstThreadMessage)
    this.isLoading = false; // End loading
  }


  getCurrentChannelData() { /** fetching data works */
    onSnapshot(doc(collection(db, 'channels'), this.activeChannelId), (doc) => {
      this.channel = new Channel(doc.data());
      // console.log('actual channel data:', this.channel)
      setTimeout(() => {
        this.getMembers();
      }, 200);
    });
  }

  getMembers() {
    const q = query(collection(db, 'users'));
    onSnapshot(q, (snapshot) => {
      this.channelMembers = [];
      snapshot.forEach((doc) => {
        const userData = doc.data();
        if (this.channel['members'].includes(doc.id)) {
          this.channelMembers.push({
            ...userData,
            userId: doc.id
          });
        }
      });
      // console.log('Channel Member:', this.channelMembers);
    });
  }


  getUserName(userId: string): string {
    const user = this.channelMembers.find(member => member.userId === userId);
    return user ? user.name : 'Unbekannter Benutzer';
  }

  /*--------------------------------- Emojis -----------------------------------*/

  toggleEmojis() {
    if (this.emojiWindowOpen) {
      this.emojiWindowOpen = false;
    } else {
      this.emojiWindowOpen = true;
    }
  }

  onEmojiSelect(event: any) {
    const emoji = event.emoji.native;
    this.messageModel += emoji;
    this.setFocusAndCursorPosition();
  }

  setFocusAndCursorPosition() {
    setTimeout(() => {
      const textArea: HTMLInputElement = this.messageInput.nativeElement;
      textArea.focus();
      const len = this.messageModel.length;
      textArea.setSelectionRange(len, len);
    }, 0);
  }

  updateCursorPosition(event: any) {
    this.currentCursorPosition = event.target.selectionStart;
  }
}
