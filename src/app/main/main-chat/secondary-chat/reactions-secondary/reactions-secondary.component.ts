import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { ReactionEmojiInputComponent } from '../../reaction-emoji-input/reaction-emoji-input.component';
import { ChatService } from '../../../../services/chat.service';
import { Subscription } from 'rxjs';

/* ========== FIREBASE ============ */
import { initializeApp } from 'firebase/app';
import { collection, getFirestore, onSnapshot, query } from 'firebase/firestore';

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
  selector: 'app-reactions-secondary',
  standalone: true,
  imports: [CommonModule, FormsModule, EmojiComponent, PickerComponent, MatIconModule, PickerModule, ReactionEmojiInputComponent],
  templateUrl: './reactions-secondary.component.html',
  styleUrl: './reactions-secondary.component.scss'
})
export class ReactionsSecondaryComponent implements OnInit, OnDestroy {
  showMoreEmojis: boolean = false;
  @Input() reactionCollectionPath!: string;
  secondaryReactionPath!: string;
  @Input() currentUser!: string;
  @Input() userId!: string;
  @Input() messageId!: any;
  private threadIdSubscription!: Subscription;
  private selectedThreadId!: string;
  reactions = [];
  reactionNames = [];
  reactionCount: number;
  activeChannelId: string = '';

  constructor(private chatService: ChatService) { 

  }

  ngOnInit(): void {
    console.log('Original reactionCollectionPath', this.reactionCollectionPath)
    this.getActualThreadId();
    this.getReactions();
    this.getReactionNames();
    //this.secondaryReactionPath = this.reactionCollectionPath;
    console.log('PIERCE reactionCollectionPath', this.secondaryReactionPath)
    // console.log('PIERCE selectedThreadId', this.selectedThreadId)
    // console.log('PIERCE messageId', this.messageId)
  }

  ngOnDestroy(): void {
    if (this.threadIdSubscription) {
      this.threadIdSubscription.unsubscribe();
    }
  }

  getReactions() {
    const q = query(collection(db, this.reactionCollectionPath));
    onSnapshot(q, (snapshot) => {
      const updatedReactions = [];
      snapshot.forEach(doc => {
        updatedReactions.push({
          id: doc.id,
          count: doc.data()['count'],
          reaction: doc.data()['reaction'],
          reactedBy: doc.data()['reactedBy']
        });
      });
      this.reactions = updatedReactions;
      // console.log('Reaction array', this.reactions);
    });
  }

  getReactionNames() {
    const q = query(collection(db, 'users'));
    return onSnapshot(q, (list) => {
      list.forEach(name => {
        for (let i = 0; i < this.reactions.length; i++) {
          let reaction = this.reactions[i];
          if (name.id == reaction.reactedBy) {
            this.reactions = this.reactions.map(obj => ({ ...obj, reactedByName: name.data()['name'] }));
          }
        };
      });
      // console.log('Reaction names', this.reactions);
    });
  }

  async updateReactionCollectionPath() {
    if (this.selectedThreadId && this.messageId && this.activeChannelId) {
      this.secondaryReactionPath = `channels/${this.activeChannelId}/threads/${this.selectedThreadId}/messages/${this.messageId}/reactions`;
      //this.reactionCollectionPath = `channels/${this.activeChannelId}/threads/${this.selectedThreadId}/messages/${this.messageId}/reactions`;
      // Aufruf von getReactions, nachdem der Pfad aktualisiert wurde
      await this.getReactions();
    } else {
      console.warn('Cannot update reactionCollectionPath due to missing IDs');
    }
  }


  getActualChannelId() {
    this.activeChannelId = this.chatService.getActiveChannelId() || 'allgemein';
    // console.log('Actual CHANNEL ID:', this.activeChannelId)
  }

  getActualThreadId() {
    this.getActualChannelId();
    this.threadIdSubscription = this.chatService.selectedThreadId$.subscribe(threadId => {
      this.selectedThreadId = threadId;
    });

    this.updateReactionCollectionPath();
  }

  openMoreEmojis() {
    this.showMoreEmojis = true;
  }

  closeMoreEmojis(showMoreEmojis: boolean) {
    this.showMoreEmojis = false;
  }
}
