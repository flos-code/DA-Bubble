import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { ReactionEmojiInputComponent } from '../../reaction-emoji-input/reaction-emoji-input.component';

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
export class ReactionsSecondaryComponent implements OnInit{
  showMoreEmojis: boolean = false;
  @Input() reactionCollectionPath!: string;
  @Input() currentUser!: string;
  @Input() userId!: string;
  @Input() message!: any;
  reactions = [];
  reactionNames = [];
  reactionCount: number;

  ngOnInit(): void {
    this.getReactions();
    this.getReactionNames();
    console.log('PIERCE', this.reactionCollectionPath)
  }

  constructor() {
console.log('PIERCE REACTION PATH:', this.reactionCollectionPath)
  }

  getReactions() {
    const q = query(collection(db, `channels/allgemein/threads/qVp8JcXz4ElKbOWPxX7U/messages/${this.message}/reactions`));
    onSnapshot(q, (snapshot) => {
        const updatedReactions = [];
        snapshot.forEach(doc => {
            updatedReactions.push({
                id: doc.id,
                count: doc.data()['count'],
                reaction: doc.data()['reactionName'],
                reactedBy: doc.data()['reactedBy']
            });
        });
        this.reactions = updatedReactions;
        console.log('Reaction array', this.reactions);
    });
}


  getReactionNames() {
    const q = query(collection(db, 'users'));
    return onSnapshot(q, (list) => {
      list.forEach(name => {
        for (let i = 0; i < this.reactions.length; i++) {
          let reaction = this.reactions[i];
          if(name.id == reaction.reactedBy) {
            this.reactions = this.reactions.map(obj => ({ ...obj, reactedByName: name.data()['name'] }));
          }
        };
      });
      console.log('Reaction names', this.reactions);
    });
  }

/*   onInputFocus(): void {
    this.inputFocused = true;
  }

  onInputBlur(): void {
    this.inputFocused = false;
  } */

/*   handleClick(event: any) {
    const emoji = event.emoji.native;
    this.insertEmojiAtCursor(emoji);
  } */

/*   async insertEmojiAtCursor(emoji: string) {
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
    //await this.saveReaction(this.messageModel, this.currentUser);
    // OS9ntlBZdogfRKDdbni6eZ9yop93
    this.showMoreEmojis = false;
    //this.showMoreEmojisChild.emit(this.showMoreEmojis);
  } */

  openMoreEmojis() {
    this.showMoreEmojis = true;
  }

  closeMoreEmojis(showMoreEmojis: boolean) {
    this.showMoreEmojis = false;
  }

/*   async saveReaction(emoji: string, currentUser: string) {
    if(this.reactions.some(reaction => reaction.reaction === emoji)) { 
      for (let i = 0; i < this.reactions.length; i++) {
        const reaction = this.reactions[i];
        if(reaction.includes(emoji)){
          reaction.count = reaction.count + 1;
          reaction.reactedBy.push(currentUser);
          let currentRef = doc(db, this.reactionCollectionPath +  reaction.id);
          console.log('reactionCollectionPath', this.reactionCollectionPath + reaction.id);
          // `channels/allgemein/threads/bx9TJQdWXkJCZry2AQpm/reactions`
          let data = {
            'count': reaction.count,
            'reaction': emoji,
            'reactedBy': currentUser,
          };
          await updateDoc(currentRef, data).then(() => {
          });
        }
      }
    } else {
      await this.addReaction(emoji, currentUser);
      console.log(currentUser);
    }
  } */

/*   async addReaction(emoji: string, currentUser: string) {
    await addDoc(collection(db, `channels/allgemein/threads/${this.threadId}/reactions`), {
      'count': 1,
      'reaction': emoji,
      'reactedBy': currentUser,
  });  
    console.log('Reactions to thread', this.reactions);
  } */
  
}
