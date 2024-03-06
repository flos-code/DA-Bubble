import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { ReactionsService } from '../../../services/reactions.service';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { Subscription } from 'rxjs';

/* ========== FIREBASE ============ */
import { initializeApp } from 'firebase/app';
import { addDoc, collection, deleteDoc, doc, getDoc, getFirestore, setDoc, updateDoc } from 'firebase/firestore';

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
  selector: 'app-reaction-emoji-input',
  standalone: true,
  imports: [CommonModule, FormsModule, EmojiComponent, PickerComponent, MatIconModule, PickerModule],
  templateUrl: './reaction-emoji-input.component.html',
  styleUrl: './reaction-emoji-input.component.scss'
})
export class ReactionEmojiInputComponent implements OnInit {
  clickEventReaction: Subscription;

  @Input() showMoreEmojis!: boolean;
  @Output() showMoreEmojisChild = new EventEmitter();
  @ViewChild('message') messageInput: ElementRef<HTMLInputElement>;
  inputFocused: boolean = false;
  messageModel: string = '';
  @Input() reactionCollectionPath!: string;
  //@Input() reactionCollectionPath: string = `channels/allgemein/threads/bx9TJQdWXkJCZry2AQpm/reactions`;
  @Input() currentUser!: string;
  @Input() threadId!: string;
  @Input() messageId!: string;
  @Input() reactions!: any;


  constructor(private reactionServie: ReactionsService) {
/*     this.clickEventReaction =  this.reactionServie.getReaction().subscribe(reaction => {
        this.saveReaction(reaction['emoji'], reaction['currentUser']);
    }) */
  }

  ngOnInit(): void {
    console.log('Current thread id', this.threadId);
    //this.reactionServie.getReactions(this.reactionCollectionPath);
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
    console.log('Alle Reaktionen', this.reactions);
    await this.saveReaction(this.messageModel, this.currentUser);
    // OS9ntlBZdogfRKDdbni6eZ9yop93
    this.showMoreEmojis = false;
    this.showMoreEmojisChild.emit(this.showMoreEmojis);
  }

  doNotClose($event: any) {
    $event.stopPropagation();
  }

  closeEmojiInput() {
    this.showMoreEmojis = false;
    this.showMoreEmojisChild.emit(this.showMoreEmojis);
  }

  // Check if subcollection exists
/*   this.db.collection('users').doc('uid')
  .get().limit(1).then(
  doc => {
    if (doc.exists) {
      this.db.collection('users').doc('uid').collection('friendsSubcollection').get().
        then(sub => {
          if (sub.docs.length > 0) {
            console.log('subcollection exists');
          }
        });
    }
  });
 */

  async saveReaction(emoji: string, currentUser: string) {
    if(this.reactions.length == 0) {
      await this.addReaction(emoji, currentUser);
    } else {
      if(this.reactions.some(reaction => reaction.reaction !== emoji)) {
        await this.addReaction(emoji, currentUser);
      } else if(this.reactions.some(reaction => reaction.reaction === emoji)) {
        for (let i = 0; i < this.reactions.length; i++) {
          const reaction = this.reactions[i];
          // User fügt ein emoji hinzu welches bereits existiert und er dieses bereits hinzugefügt hat
          if(reaction.reaction == emoji && reaction.reactedBy.includes(currentUser)){
            if(reaction.reactedBy.length > 1) {
              reaction.count = reaction.count - 1;
              reaction.reactedBy.splice(currentUser);
              let currentRef = doc(db, this.reactionCollectionPath + '/' +  reaction.id);
              // `channels/allgemein/threads/bx9TJQdWXkJCZry2AQpm/reactions`
              let data = {
                count: reaction.count,
                reaction: emoji,
                reactedBy: reaction.reactedBy,
              };
              await updateDoc(currentRef, data).then(() => {
              });  
            } else {
              await deleteDoc(doc(db, this.reactionCollectionPath, reaction.id));
            }
  
          // User fügt ein emoji hinzu welches bereits existiert und aber von Ihm nicht hinzugefügt wurde
          } else if(reaction.reaction == emoji && !reaction.reactedBy.includes(currentUser)) {
            reaction.count = reaction.count + 1;
            reaction.reactedBy.push(currentUser);
            let currentRef = doc(db, this.reactionCollectionPath + '/' + reaction.id);
            //console.log('reactionCollectionPath', this.reactionCollectionPath + '/' + reaction.id);
            // `channels/allgemein/threads/bx9TJQdWXkJCZry2AQpm/reactions`
            let data = {
              count: reaction.count,
              reaction: emoji,
              reactedBy: reaction.reactedBy,
            };
            await updateDoc(currentRef, data).then(() => {
            });
          }
        }
      }
    }
    


      
/*     } else {
      // User ist im reactions array nicht enthalten => neue reaction wird hinzugefügt
      console.log('Add new emoji');
      await this.addReaction(emoji, currentUser);
    } */
  }
 

  async addReaction(emoji: string, currentUser: string) {
      let newReaction = await addDoc(collection(db, this.reactionCollectionPath), {
        count: 1,
        reaction: emoji,
        reactedBy: [currentUser],
      });
      console.log('New reaction added', newReaction);
  }
}
