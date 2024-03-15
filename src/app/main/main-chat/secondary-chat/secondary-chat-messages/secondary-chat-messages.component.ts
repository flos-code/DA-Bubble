import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { ReactionEmojiInputComponent } from '../../reaction-emoji-input/reaction-emoji-input.component';

/* =============================== */

@Component({
  selector: 'app-secondary-chat-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ReactionEmojiInputComponent],
  templateUrl: './secondary-chat-messages.component.html',
  styleUrl: './secondary-chat-messages.component.scss'
})
export class SecondaryChatMessagesComponent implements OnInit, OnDestroy {
  @Input() currentUser!: string;
  @Input() message!: any;
  @Input() messageId: string;
  @Input() threadId!: string;
  @Input() activeChannelId!: string;
  @Input() channelMembers!: any;
  reactions = [];
  currentUserName: string;
  reactionNames =  [];
  reactionCollectionPath: string;
  editingMessageText: string;
  openEditOwnMessage: boolean = false;
  openEditOwnInput: boolean = false;
  showMoreEmojis: boolean = false;
  showMoreEmojisToolbar: boolean = false;
  messageDeleted: boolean = false;

  private firestore: Firestore = inject(Firestore);

  constructor() { }

  ngOnInit(): void {
      this.reactionCollectionPath = `channels/${this.activeChannelId}/threads/${this.threadId}/messages/${this.messageId}/reactions`;
      this.getReactions();
      document.addEventListener('mousedown', this.handleClickOutside, true);
  }

  ngOnDestroy() {
    document.removeEventListener('mousedown', this.handleClickOutside, true);
  }

  handleClickOutside = (event: MouseEvent) => {
    const editMessageInput = document.querySelector('.edit-message-input');
    if (editMessageInput && !editMessageInput.contains(event.target as Node)) {
      this.openEditOwnInput = false;
      this.saveMessageChanges();
    }
  }

  async getReactions() {
    this.getCurrentUserName();
    const q = query(collection(this.firestore, this.reactionCollectionPath));
    await onSnapshot(q, (element) => {
      this.reactions = [];
      this.reactionNames = [];
      element.forEach(reaction => {
        this.getReactionNames(reaction.data()['reactedBy']);
        this.reactions.push({
          'id': reaction.id,
          'count': reaction.data()['count'],
          'reaction': reaction.data()['reaction'],
          'reactedBy': reaction.data()['reactedBy'],
          'reactedByName': this.reactionNames
        });
        this.sortReactionIds();
        this.sortReactionNames();
      });
    });
  }

  async getCurrentUserName() {
    let docRef = doc(this.firestore, 'users', this.currentUser);
    const docSnap = await getDoc(docRef);
    this.currentUserName = docSnap.data()['name'];
  }

  getReactionNames(reactedByArray: any) {
    const q = query(collection(this.firestore, 'users'));
    onSnapshot(q, (list) => {
      list.forEach(user => {
        for (let i = 0; i < reactedByArray.length; i++) {
          const reactedBy = reactedByArray[i];
          if(user.id == reactedBy && !this.reactionNames.includes(user.data()['name'])) {
            this.reactionNames.push(user.data()['name']);
          }
        }
      });
    });
  }

  sortReactionIds() {
    for (let i = 0; i < this.reactions.length; i++) {
      const userId = this.reactions[i];
      if(userId.reactedBy.includes(this.currentUser)) {
        let index = -1;
        index = userId.reactedBy.findIndex(obj => obj == this.currentUser);
        userId.reactedBy.splice(index, 1);
        userId.reactedBy.unshift(this.currentUser);
      }
    }
  }

  sortReactionNames() {
    for (let i = 0; i < this.reactions.length; i++) {
      const userName = this.reactions[i];
      if(userName.reactedByName.includes(this.currentUserName)) {
        let index = -1;
        index = userName.reactedByName.findIndex(obj => obj == this.currentUserName);
        userName.reactedBy.splice(index, 1);
        userName.reactedByName.unshift(this.currentUserName);
      }
    }
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
              let currentRef = doc(this.firestore, this.reactionCollectionPath + '/' +  reaction.id);
              let data = {
                count: reaction.count,
                reaction: emoji,
                reactedBy: reaction.reactedBy,
              };
              await updateDoc(currentRef, data).then(() => {
              });  
            } else {
              await deleteDoc(doc(this.firestore, this.reactionCollectionPath, reaction.id));
            }
          } else if(emoji == reaction.reaction && !reaction.reactedBy.includes(currentUser)) {
            reaction.count = reaction.count + 1;
            reaction.reactedBy.push(currentUser);
            let currentRef = doc(this.firestore, this.reactionCollectionPath + '/' + reaction.id);
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
    let newReaction = await addDoc(collection(this.firestore, this.reactionCollectionPath), {
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
    const messageRef = doc(this.firestore, `channels/${this.activeChannelId}/threads/${this.threadId}/messages`, this.messageId);
  
    if (this.editingMessageText === '') {
      this.editingMessageText = '';
      this.openEditOwnInput = false;
      this.messageDeleted = true;
      setTimeout(() => {
        this.messageDeleted = false;
         deleteDoc(messageRef);
      }, 1000);
  
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
