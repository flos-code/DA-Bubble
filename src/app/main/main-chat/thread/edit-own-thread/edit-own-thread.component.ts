import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';


/* ========== FIREBASE ============ */
import { initializeApp } from 'firebase/app';
import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { MainChatComponent } from '../../main-chat.component';

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
/* =============================== */

@Component({
  selector: 'app-edit-own-thread',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MainChatComponent, PickerComponent, EmojiComponent ],
  templateUrl: './edit-own-thread.component.html',
  styleUrl: './edit-own-thread.component.scss'
})
export class EditOwnThreadComponent implements OnInit {
  @ViewChild('message') messageInput: ElementRef<HTMLInputElement>;
  @Input() textAreaEditMessage!: string;
  @Input() threadId!: string;
  @Input() activeChannelId!: string;
  @Input() threadMessage!: any;
  ownMessageEdit: boolean;
  @Output() ownMessageEditChild = new EventEmitter(); 
  inputFocused: boolean = false;
  showEmojiPicker: boolean = false;
  showMentionUser: boolean = false;

  constructor(private main: MainChatComponent) { }

  ngOnInit(): void {
      this.textAreaEditMessage = this.threadMessage;
  }

  closeEditedMessage() {
    this.ownMessageEdit = false;
    this.ownMessageEditChild.emit(this.ownMessageEdit);
  }

  async saveEditedMessage() {
    if(this.textAreaEditMessage) {
      let currentThreadRef = doc(db, `channels/${this.activeChannelId}/threads/${this.threadId}`);
      let data = {message: this.textAreaEditMessage };
      //this.main.channelThreadsDateTime = [];

      await updateDoc(currentThreadRef, data).then(() => {
      });
      this.ownMessageEdit = false;
      this.ownMessageEditChild.emit(this.ownMessageEdit);
    } else {
      await deleteDoc(doc(db, `channels/${this.activeChannelId}/threads/`, this.threadId));
      this.ownMessageEdit = false;
      this.ownMessageEditChild.emit(this.ownMessageEdit);
    }
    }

    onInputFocus(): void {
      this.inputFocused = true;
    }
  
    onInputBlur(): void {
      this.inputFocused = false;
    }

    handleClick(event: any) {
      const emoji = event.emoji.native;
      this.insertEmojiAtCursor(emoji);
    }
  
    insertEmojiAtCursor(emoji: string) {
      const inputEl = this.messageInput.nativeElement;
      const start = inputEl.selectionStart;
      const end = inputEl.selectionEnd;
      const text = inputEl.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      this.textAreaEditMessage = before + emoji + after;
  
      const newPos = start + emoji.length;
      setTimeout(() => {
        inputEl.selectionStart = inputEl.selectionEnd = newPos;
      });
    }

    toggleEmojiPicker() {
      this.showEmojiPicker = !this.showEmojiPicker;
    }
  
    closeEmojiPickerOrMentionUser() {
      if (this.showEmojiPicker) {
        this.showEmojiPicker = false;
      }
      if (this.showMentionUser) {
        this.showMentionUser = false;
      }
    }

    doNotClose($event: any) {
      $event.stopPropagation();
    }
}
