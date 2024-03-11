import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


/* ========== FIREBASE ============ */
import { initializeApp } from 'firebase/app';
import { addDoc, collection, deleteDoc, doc, getFirestore, onSnapshot, query, updateDoc } from 'firebase/firestore';
import { ReactionEmojiInputComponent } from '../../reaction-emoji-input/reaction-emoji-input.component';

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
  selector: 'app-secondary-chat-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ReactionEmojiInputComponent],
  templateUrl: './secondary-chat-messages.component.html',
  styleUrl: './secondary-chat-messages.component.scss'
})
export class SecondaryChatMessagesComponent implements OnInit {
  @Input() currentUser!: string;
  @Input() message!: any;
  @Input() messageId: string;
  @Input() threadId!: string;
  @Input() activeChannelId!: string;
  @Input() channelMembers!: any;
  reactions = [];
  reactionCollectionPath: string;
  editingMessageText: string;
  openEditOwnMessage: boolean = false;
  openEditOwnInput: boolean = false;
  showMoreEmojis: boolean = false;
  showMoreEmojisToolbar: boolean = false;
  messageDeleted: boolean = false;

  constructor() { }

  ngOnInit(): void {
      this.reactionCollectionPath = `channels/${this.activeChannelId}/threads/${this.threadId}/messages/${this.messageId}/reactions`;
      this.getReactions();
  }

  getReactions() {
    const q = query(collection(db, `channels/${this.activeChannelId}/threads/${this.threadId}/messages/${this.messageId}/reactions`));
    return onSnapshot(q, (element) => {
      this.reactions = [];
      element.forEach(reaction => {
        this.reactions.push({
          'id': reaction.id,
          'count': reaction.data()['count'],
          'reaction': reaction.data()['reaction'],
          'reactedBy': reaction.data()['reactedBy']
        }
        )
      });
      this.getReactionNames();
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
    });
  }

  async saveReaction(emoji: string, currentUser: string) {
    if(this.reactions.length == 0) {
      console.log('Alle Reaktionen', this.reactions);
      await this.addReaction(emoji, currentUser);
    } else {
      if(this.reactions.some(reaction => reaction.reaction == emoji)) {
        for (let i = 0; i < this.reactions.length; i++) {
          const reaction = this.reactions[i];
          if(emoji == reaction.reaction && reaction.reactedBy.includes(currentUser)) {
            if(reaction.reactedBy.length > 1) {
              reaction.count = reaction.count - 1;
              let index = reaction.reactedBy.indexOf(currentUser);
              reaction.reactedBy.splice(index, 1);
              let currentRef = doc(db, this.reactionCollectionPath + '/' +  reaction.id);
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
          } else if(emoji == reaction.reaction && !reaction.reactedBy.includes(currentUser)) {
            reaction.count = reaction.count + 1;
            reaction.reactedBy.push(currentUser);
            let currentRef = doc(db, this.reactionCollectionPath + '/' + reaction.id);
            let data = {
              count: reaction.count,
              reaction: emoji,
              reactedBy: reaction.reactedBy,
            };
            await updateDoc(currentRef, data).then(() => {
            });
          }         
        }
      } else {
        await this.addReaction(emoji, currentUser); 
      }
    }
  }

  async addReaction(emoji: string, currentUser: string) {
    let newReaction = await addDoc(collection(db, this.reactionCollectionPath), {
        count: 1,
        reaction: emoji,
        reactedBy: [currentUser],
      });
      console.log('New reaction added', newReaction);
  }

  openMoreEmojis() {
    this.showMoreEmojis = true;
  }

  openMoreEmojisToolbar() {
    this.showMoreEmojisToolbar = true;
  }

  async saveMessageChanges() {
    const messageRef = doc(db, `channels/${this.activeChannelId}/threads/${this.threadId}/messages`, this.messageId);
  
    if (this.editingMessageText === '') {
      this.editingMessageText = '';
      this.openEditOwnInput = false;
      this.messageDeleted = true;
      setTimeout(() => {
        this.messageDeleted = false;
         deleteDoc(messageRef);
      }, 1500);
  
    } else {
      await updateDoc(messageRef, { message: this.editingMessageText });
      this.editingMessageText = '';
      this.openEditOwnInput = false;
    }
  }
  
  openEditOwnMessageField() {
    this.openEditOwnMessage = true;
  }

  startEditMessage() {
    this.openEditOwnInput = true;
    this.openEditOwnMessage = false;
    this.editingMessageText = this.message.message;
  }

  getUserName(userId: string): string {
    const user = this.channelMembers.find(member => member.userId === userId);
    return user ? user.name : 'Unbekannter Benutzer';
  }

  getUserProfileImageUrl(userId: string): string {
    const user = this.channelMembers.find(member => member.userId === userId);
    return user ? user.imgUrl : 'imgUrl';
  }  

  closeMoreEmojis(showMoreEmojis: boolean) {
    this.showMoreEmojis = false;
    this.showMoreEmojisToolbar = false;
  }
}
