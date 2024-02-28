import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


/* ========== FIREBASE ============ */
import { initializeApp } from 'firebase/app';
import { collection, doc, getDoc, getDocs, getFirestore, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore';
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
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MainChatComponent],
  templateUrl: './edit-own-thread.component.html',
  styleUrl: './edit-own-thread.component.scss'
})
export class EditOwnThreadComponent implements OnInit {
  @Input() textAreaEditMessage: string;
  @Input() threadId;
  @Input() activeChannelId;
  @Input() threadMessage;
  ownMessageEdit: boolean;
  @Output() ownMessageEditChild = new EventEmitter();

  constructor(private main: MainChatComponent) { }

  ngOnInit(): void {
      this.textAreaEditMessage = this.threadMessage;
  }


  closeEditedMessage() {
    this.ownMessageEdit = false;
    this.ownMessageEditChild.emit(this.ownMessageEdit);
  }

  async saveEditedMessage() {
      let currentThreadRef = doc(db, `channels/${this.activeChannelId}/threads/${this.threadId}`);
      let data = {message: this.textAreaEditMessage };
      //this.main.channelThreadsDateTime = [];

      await updateDoc(currentThreadRef, data).then(() => {
      });
      this.ownMessageEdit = false;
      this.ownMessageEditChild.emit(this.ownMessageEdit);
      this.main.scrollToBottom();
    }
}
