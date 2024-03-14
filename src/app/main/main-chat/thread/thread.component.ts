import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChatService } from '../../../services/chat.service';
import { EditOwnThreadComponent } from './edit-own-thread/edit-own-thread.component';
import { MainChatComponent } from '../main-chat.component';
import { ReactionEmojiInputComponent } from '../reaction-emoji-input/reaction-emoji-input.component';

/* ========== FIREBASE ============ */
import { initializeApp } from 'firebase/app';
import { addDoc, collection, deleteDoc, doc, getCountFromServer, getDoc, getFirestore, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { ViewManagementService } from '../../../services/view-management.service';
import { Subscription } from 'rxjs';

import { environment } from '../../../../environments/environment.development';
const app = initializeApp(environment.firebase);
const db = getFirestore(app);
/* =============================== */

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, EditOwnThreadComponent, ReactionEmojiInputComponent],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent implements OnInit {
  @Input() thread!: any;
  @Input() currentUser!: string;
  @Input() activeChannelId!: string;

  messageCount: number;
  threadMessagesTimestamps = [];
  answers: string;
  lastAnswer: any;
  showMoreEmojis: boolean = false;
  showMoreEmojisToolbar: boolean = false;
  reactionCollectionPath: string;
  editMessagePopupOpen: boolean = false;
  ownMessageEdit: boolean = false;
  //@Input() textAreaEditMessage: string;
  reactions = [];
  currentUserName: string;
  reactionNames =  [];
  reactionCount: number;

  constructor(private chatService: ChatService, private main: MainChatComponent, public viewManagementService: ViewManagementService,) { 

  }

  ngOnInit(): void {
    this.loadThreadData();
  }

/*   async getThreadMessageCount() {
    const messages = collection(db, 'channels/allgemein/threads/bx9TJQdWXkJCZry2AQpm/messages');
    const snapshot = await getCountFromServer(messages);
    this.messageCount = snapshot.data().count;
    console.log('Message count', this.messageCount);
    console.log('Message count', snapshot.data().count);
    this.formatMessageCount();
  } */

  loadThreadData() {
    this.reactionCollectionPath = `channels/${this.activeChannelId}/threads/${this.thread.threadId}/reactions`;
    this.getCurrentUserName();
    this.getReactions();
    this.getMessageCountAndAnswer();
  }

  async getReactions() {
    this.getCurrentUserName();
    const q = query(collection(db, this.reactionCollectionPath));
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
    let docRef = doc(db, 'users', this.currentUser);
    const docSnap = await getDoc(docRef);
    this.currentUserName = docSnap.data()['name'];
  }

  getReactionNames(reactedByArray: any) {
    const q = query(collection(db, 'users'));
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

    async getMessageCountAndAnswer() {
     const messagesRef = collection(db, `channels/${this.activeChannelId}/threads/${this.thread.threadId}/messages`);
     const q = query(messagesRef, orderBy('creationDate', 'desc'));
  
     onSnapshot(q, (snapshot) => {
     this.messageCount = snapshot.docs.length;
     console.log('Anzahl Antworten', this.messageCount);
    this.formatMessageCount();
  
       if (this.messageCount > 0) {
         const lastMessageTimestamp = snapshot.docs[0].data()['creationDate'];
         this.lastAnswer = this.main.getFormattedTime(lastMessageTimestamp);
       }
     });
   }

/*    async getMessageCountAndAnswer() {
     const q = query(collection(db, `channels/allgemein/threads/${this.thread.threadId}/messages`), orderBy('creationDate', 'desc'))
     const count = await getCountFromServer(q);
     this.messageCount = count.data().count;
     this.formatMessageCount();

     return onSnapshot(q, (element) => {
       this.threadMessagesTimestamps = [];
       element.forEach(thread => {
         this.threadMessagesTimestamps.push(thread.data()['creationDate']);
       }
     )  
     this.lastAnswer = this.main.getFormattedTime(this.threadMessagesTimestamps[0])
     this.formatMessageCount; 
     });
   } */

  formatMessageCount() {
    if(this.messageCount > 1 || this.messageCount == 0) {
      this.answers = 'Antworten';
    } else {
      this.answers = 'Antwort';
    }
  }

  getLastAnswer() {
    this.lastAnswer
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

  closeMoreEmojis(showMoreEmojis: boolean) {
    this.showMoreEmojis = false;
    this.showMoreEmojisToolbar = false;
  }

  moreOptions() {
    this.editMessagePopupOpen = true;
  }

  editMessage() {
    this.editMessagePopupOpen = false;
    this.ownMessageEdit = true;
  }

  closeEditMessagePopUp() {
    this.editMessagePopupOpen = false;
  }

  openThread(threadId: string): void {
    this.chatService.openThread(threadId);
    this.viewManagementService.setView('secondaryChat');
  }

  closeEditedMessage(dialogBoolen: boolean) {
    this.ownMessageEdit = false;
  }

  doNotClose($event: any) {
    $event.stopPropagation();
  }
}
