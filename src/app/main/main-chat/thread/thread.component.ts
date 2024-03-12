import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChatService } from '../../../services/chat.service';
import { EditOwnThreadComponent } from './edit-own-thread/edit-own-thread.component';
import { MainChatComponent } from '../main-chat.component';
import { ReactionEmojiInputComponent } from '../reaction-emoji-input/reaction-emoji-input.component';
import { BehaviorSubject } from 'rxjs';

/* ========== FIREBASE ============ */
import { initializeApp } from 'firebase/app';
import { addDoc, collection, deleteDoc, doc, getCountFromServer, getFirestore, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';

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
  selector: 'app-thread',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, EditOwnThreadComponent, ReactionEmojiInputComponent],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent implements OnInit {
  @Input() thread!: any;
  //Input() currentUser!: BehaviorSubject<string | null>;
  @Input() currentUser!: string;
  currentUserName: string;
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
  reactionNames =  [];
  reactionCount: number;

  constructor(private chatService: ChatService, private main: MainChatComponent) { }

  ngOnInit(): void {
    this.reactionCollectionPath = `channels/${this.activeChannelId}/threads/${this.thread.threadId}/reactions`;
    this.getReactions();
    this.getMessageCountAndAnswer();
  }

/*   async getThreadMessageCount() {
    const messages = collection(db, 'channels/allgemein/threads/bx9TJQdWXkJCZry2AQpm/messages');
    const snapshot = await getCountFromServer(messages);
    this.messageCount = snapshot.data().count;
    console.log('Message count', this.messageCount);
    console.log('Message count', snapshot.data().count);
    this.formatMessageCount();
  } */

  async getReactions() {
    const q = query(collection(db, `channels/allgemein/threads/allgemein/reactions`));
    await onSnapshot(q, (element) => {
      this.reactions = [];
      element.forEach(reaction => {
        this.reactions.push({
          'id': reaction.id,
          'count': reaction.data()['count'],
          'reaction': reaction.data()['reaction'],
          'reactedBy': reaction.data()['reactedBy'],
          'reactedByName': []
        });
      });
    });
    this.sortReactions();
    this.getReactionNames();
    console.log(this.reactions);
  }

  async getReactionNames() {
    const q = query(collection(db, 'users'));
    return await onSnapshot(q, (list) => {
      list.forEach(user => {
       for (let i = 0; i < this.reactions.length; i++) {
          const reaction = this.reactions[i];
          reaction.reactedByName = [];
          for (let r = 0; r < reaction.reactedBy.length; r++) {
            const reactionId = reaction.reactedBy[r];
            if(user.id == reactionId) {
              reaction.reactedByName.push(user.data()['name']);
            }
          }
        }
      });
    });
  }

  sortReactions() {
    if(this.reactions.some(reaction => reaction.createdBy == this.currentUser)) {
      for (let i = 0; i < this.reactions.length; i++) {
        const reaction = this.reactions[i];
        let index = -1;
        index = reaction.reactedBy.findIndex(obj => obj.name == this.currentUser);
        reaction.reactedBy.unshift(index, 1)[0];
      }
      for (let i = 0; i < this.reactions.length; i++) {
        const reaction = this.reactions[i];
        let index = -1;
        index = reaction.reactedByName.findIndex(obj => obj.name == this.currentUserName);
        reaction.reactedByNAme.unshift(index, 1)[0];
      }
    }
  }


  
/*   getReactionNames() {
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
  } */

  async getMessageCountAndAnswer() {
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
  }

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
  /* const myArray = [1, 2, 3, 4, 5];

  const index = myArray.indexOf(2);

  const x = myArray.splice(index, 1);

  console.log(`myArray values: ${myArray}`);
  console.log(`variable x value: ${x}`); */





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
  }

  closeEditedMessage(dialogBoolen: boolean) {
    this.ownMessageEdit = false;
  }

  doNotClose($event: any) {
    $event.stopPropagation();
  }
}
