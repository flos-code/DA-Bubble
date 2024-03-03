import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { ReactionsService } from '../../../services/reactions.service';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { ReactionEmojiInputComponent } from '../reaction-emoji-input/reaction-emoji-input.component';

/* ========== FIREBASE ============ */
import { initializeApp } from 'firebase/app';
import { collection, doc, getCountFromServer, getDoc, getDocs, getFirestore, onSnapshot, orderBy, query, where } from 'firebase/firestore';

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
  selector: 'app-reactions',
  standalone: true,
  imports: [CommonModule, FormsModule, EmojiComponent, PickerComponent, MatIconModule, PickerModule, ReactionEmojiInputComponent],
  templateUrl: './reactions.component.html',
  styleUrl: './reactions.component.scss'
})
export class ReactionsComponent implements OnInit {
  //@Input() showMoreEmojis!: boolean;
  showMoreEmojis: boolean = false;
  //@Output() showMoreEmojisChild = new EventEmitter();
  @ViewChild('message') messageInput: ElementRef<HTMLInputElement>;
  inputFocused: boolean = false;
  messageModel: string = '';
  @Input() reactionCollectionPath!: string;
  // @Input() reactionCollectionPath: string = `channels/allgemein/threads/bx9TJQdWXkJCZry2AQpm/reactions`;
  @Input() currentUser!: string;
  @Input() userId!: string;
  reactions = [];
  @Input() threadId!: string;

  constructor(private reactionServie: ReactionsService) {
  }

  getReactions() {
    const q = query(collection(db, `channels/allgemein/threads/${this.threadId}/reactions`));
    return onSnapshot(q, (element) => {
      this.reactions = [];
      element.forEach(reaction => {
        this.reactions.push(reaction.data());
      }
      )
      console.log('All reactions', this.reactions);  
    });
  }

  ngOnInit(): void {
    this.reactionServie.getReactions(this.reactionCollectionPath);
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

  async insertEmojiAtCursor(emoji: string) {
    const inputEl = this.messageInput.nativeElement;
    const start = inputEl.selectionStart;
    const end = inputEl.selectionEnd;
    const text = inputEl.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    this.messageModel = before + emoji + after;

    const newPos = start + emoji.length;
    setTimeout(() => {
      inputEl.selectionStart = inputEl.selectionEnd = newPos;
    });
    await this.reactionServie.saveReaction(this.messageModel, this.currentUser);
    // OS9ntlBZdogfRKDdbni6eZ9yop93
    this.showMoreEmojis = false;
    //this.showMoreEmojisChild.emit(this.showMoreEmojis);
  }

  openMoreEmojis() {
    this.showMoreEmojis = true;
  }

  closeMoreEmojis(showMoreEmojis: boolean) {
    this.showMoreEmojis = false;
  }
}
