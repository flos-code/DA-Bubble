import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChatService } from '../../../services/chat.service';
import { EditOwnThreadComponent } from './edit-own-thread/edit-own-thread.component';
import { MainChatComponent } from '../main-chat.component';
import { ReactionsComponent } from '../reactions/reactions.component';
import { ReactionEmojiInputComponent } from '../reaction-emoji-input/reaction-emoji-input.component';

/* ========== FIREBASE ============ */
import { initializeApp } from 'firebase/app';
import { collection, getCountFromServer, getFirestore, onSnapshot, orderBy, query } from 'firebase/firestore';
import { BehaviorSubject } from 'rxjs';
import { ReactionsService } from '../../../services/reactions.service';

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
  imports: [CommonModule, FormsModule, ReactiveFormsModule, EditOwnThreadComponent, ReactionsComponent, ReactionEmojiInputComponent],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent implements OnInit {
  @Input() thread!: any;
  //Input() currentUser!: BehaviorSubject<string | null>;
  @Input() currentUser!: string;
  @Input() activeChannelId!: string;
  messageCount: number;
  threadMessagesTimestamps = [];
  answers: string;
  lastAnswer: any;
  showMoreEmojis: boolean = false;
  reactionCollectionPath: string;
  editMessagePopupOpen: boolean = false;
  ownMessageEdit: boolean = false;
  //@Input() textAreaEditMessage: string;
  reactions = [];


  constructor(private chatService: ChatService, private main: MainChatComponent, private reactionService: ReactionsService) { }

  ngOnInit(): void {
    this.getReactions();
    this.getMessageCountAndAnswer();
    this.reactionCollectionPath = `channels/${this.activeChannelId}/threads/${this.thread.threadId}/reactions`;
  }

/*   async getThreadMessageCount() {
    const messages = collection(db, 'channels/allgemein/threads/bx9TJQdWXkJCZry2AQpm/messages');
    const snapshot = await getCountFromServer(messages);
    this.messageCount = snapshot.data().count;
    console.log('Message count', this.messageCount);
    console.log('Message count', snapshot.data().count);
    this.formatMessageCount();
  } */

  getReactions() {
    const q = query(collection(db, `channels/allgemein/threads/${this.thread.threadId}/reactions`));
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
    });
  }

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

  addReaction(emoji: string, currentUser: string) {
    this.reactionService.sendReaction(emoji, currentUser);
  }

  openMoreEmojis() {
    this.showMoreEmojis = true;
  }

  closeMoreEmojis(showMoreEmojis: boolean) {
    this.showMoreEmojis = false;
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
