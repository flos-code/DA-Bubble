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
  emojiWindowOpen = false;
  threadOpen: boolean = true;
  threads: Thread[] = [];
  messageModel: string = '';
  currentCursorPosition: number = 0;
  private subscription = new Subscription();
  threadMessages: ThreadMessage[] = [];
  firstThreadMessage?: ThreadMessage;
  activeChannelId: string = 'allgemein';
  channelId: string = 'allgemein';
  currentUser: string = 'OS9ntlBZdogfRKDdbni6eZ9yop93';
  creationDate: Date;
  DialogRef: any;

  constructor(
    private chatService: ChatService,
    public inputService: InputService
  ) { }

  ngOnInit(): void {
    this.subscription.add(this.chatService.selectedThreadId$.subscribe(threadId => {
      if (threadId) {
        this.loadThreadMessages(threadId);
      } else {
        console.log('No thread ID available');
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /*--------------------------------- ThreadMessages -----------------------------------*/

  async loadThreadMessages(threadId: string) {
    const channelId = this.chatService.getActiveChannelId();
    await this.chatService.getThreadMessages(this.channelId, threadId).then(threadMessages => {
      this.threadMessages = threadMessages;
    });
  }

  // getFormattedTime(creationDate: number) {
  //   const getString = (number) => number < 10 ? '0' + number : String(number);
  //   const getTime = (creationDate: number) => {
  //       const date = new Date(creationDate);
  //       const hours = getString(date.getHours());
  //       const minutes = getString(date.getMinutes());
  //       return `${hours}:${minutes}`;
  //   };
  //   return getTime(creationDate);
  // }

  // getUserCreated(userId: string) {
  //   let user = ""; 
  //   for (let i = 0; i < this.channelMembers.length; i++) {
  //     const userCreated = this.channelMembers[i];
  //     if(userId == userCreated['id']) {
  //       user = userCreated['name'];
  //     }
  //   }
  //   return user;
  // }

//   getMembers() {
//     const q = query(collection(db, 'users'));
//     return onSnapshot(q, (list) => {
//       this.channelMembers = [];
//       list.forEach(element => {
//         if(this.channel['members'].includes(element.id)) {
//           this.channelMembers.push(element.data());
//         }    
//       });
//   });   
// }

  closeThread(): void {
    this.chatService.closeThread();
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
