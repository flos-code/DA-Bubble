import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent, EmojiEvent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, limit, query, doc, getDoc, updateDoc, addDoc, getDocs, deleteDoc, orderBy } from "firebase/firestore";
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
  activeChannelId: string = 'allgemein';
  channelId: string = 'allgemein';
  messages = [
    {
      id: 1,
      message: 'Welche Version ist aktuell von Angular?',
      sender: 'user',
      time: '14:25',
      own: false
    },
    {
      id: 2,
      message: 'Ich habe die gleiche Frage. Ich habe gegoogelt und es scheint, dass die aktuelle Version Angular 13 ist. Vielleicht weiß Frederik, ob es wahr ist.',
      sender: 'user',
      time: '14:30',
      own: false
    },
    {
      id: 3,
      message: 'Ja das ist es.',
      sender: 'user',
      time: '15:06',
      own: false
    }
  ];
  DialogRef: any;

  constructor(
    private chatService: ChatService,
    public inputService: InputService,
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

  async loadThreadMessages(threadId: string) {
    const channelId = this.chatService.getActiveChannelId();
     await this.chatService.getThreadMessages(this.channelId, threadId).then(threadMessages => {
      this.threadMessages = threadMessages;
      console.log('Geladene ThreadId:', threadId)
      console.log('Geladene Thread-Nachrichten:', this.threadMessages);
    });
  }

  /**
 * Closes the chat thread.
 */
  closeThread(): void {
    this.chatService.closeThread();
  }

  /**
 * Toggles the visibility of the emoji window.
 */
  toggleEmojis() {
    if (this.emojiWindowOpen) {
      this.emojiWindowOpen = false;
    } else {
      this.emojiWindowOpen = true;
    }
  }

  /**
   * Handles the selection of an emoji.
   * @param {any} event - The event object.
   */
  onEmojiSelect(event: any) {
    const emoji = event.emoji.native;
    this.messageModel += emoji; // Adds the emoji at the end of the text

    // Restores focus to the text field and sets the cursor position
    this.setFocusAndCursorPosition();
  }

  /**
   * Sets focus and cursor position.
   */
  setFocusAndCursorPosition() {
    setTimeout(() => {
      const textArea: HTMLInputElement = this.messageInput.nativeElement;
      textArea.focus(); // Sets focus to the text field
      const len = this.messageModel.length; // Determines the length of the updated text
      textArea.setSelectionRange(len, len); // Sets the cursor position at the end of the text
    }, 0);
  }

  /**
 * Updates the current cursor position based on user interactions.
 * @param {any} event - The event object.
 */
  updateCursorPosition(event: any) {
    this.currentCursorPosition = event.target.selectionStart;
  }
}
