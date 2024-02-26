import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { ChannelEditionDialogComponent } from './channel-edition-dialog/channel-edition-dialog.component';
import { ShowMembersDialogComponent } from './show-members-dialog/show-members-dialog.component';
import { AddMembersDialogComponent } from './add-members-dialog/add-members-dialog.component';
import { SecondaryChatComponent } from './secondary-chat/secondary-chat.component';
import { ChatService } from '../../services/chat.service';
import { Subscription } from 'rxjs';
import { Channel } from '../../../models/channel.class';
import { Message } from '../../../models/message.class';
import { Thread } from '../../../models/thread.class';

/* ========== FIREBASE ============ */
import { initializeApp } from 'firebase/app';
import { collection, doc, getFirestore, onSnapshot, orderBy, query } from 'firebase/firestore';

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
  selector: 'app-main-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, ReactiveFormsModule, MatFormFieldModule,
    ChannelEditionDialogComponent, ShowMembersDialogComponent, AddMembersDialogComponent, SecondaryChatComponent],
  templateUrl: './main-chat.component.html',
  styleUrl: './main-chat.component.scss'
})

export class MainChatComponent implements OnInit, OnDestroy {
  channel: Channel;
  channelId: string = 'allgemein';
  channelThreads: Message[] = [];
  threadId: string = '';
  threadCreationDates = [];
  currentUser: string = 'OS9ntlBZdogfRKDdbni6eZ9yop93';

  dmUser = [];

  @Input() textAreaEditMessage: string = "Welche Version ist aktuell von Angular?";
  subscription: Subscription = new Subscription();
  threadOpen: boolean = false;
  threads: Thread[] = [];
  textArea: string = "";
  showChannel: boolean = true;
  addMemberDialogOpen: boolean = false;
  channelEditionDialogOpen: boolean = false;
  showMembersDialogOpen: boolean = false;
  ownMessage: boolean = true;
  editMessagePopupOpen: boolean = false;
  ownMessageEdit: boolean = false;

  newMember: string = "";
  newMemberObject = {
    'userId': 'ikeikeoie',
    'name': this.newMember,
    'surname': 'M.',
    'photo': '../../../assets/img/main-chat/member2.svg'
  };

  constructor(private chatService: ChatService) { }

  ngOnInit(): void {
    this.getCurrentChannel();
    this.getThreadOpenStatus();
    this.subscribeToThreads();
    //this.getCurrentDirectMessage();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /* ================== MAIN CHAT CHANNEL DATA ================== */
  getCurrentChannel() {
    onSnapshot(doc(collection(db, 'channels'), this.channelId), (doc) => {
      this.channel = new Channel(doc.data());
      console.log('Channel data', this.channel);
      this.getThreads();
    });
  }

  getThreads() {
    //const q = query(collection(db, `channels'/${this.channelId}/messages`));
    const q = query(collection(db, 'channels/allgemein/threads'), orderBy("creationDate", "asc"));
    return onSnapshot(q, (list) => {
      this.channelThreads = [];
      list.forEach(thread => {
          this.channelThreads.push(new Message(thread.data()));
          console.log('Channel messages data', this.channelThreads);
        }
      )
      this.sortChannelThreadsArray();
      this.getThreadCreationDates();
    });
  }

  sortChannelThreadsArray() {
    this.channelThreads.sort(this.compareByCreationDate);
    console.log('Sorted channel threads array', this.channelThreads);
  }

  compareByCreationDate(b: any, a: any) {
    if(b.creationDate < a.creationDate){
      return -1;
    }
    
    if(b.creationDate > a.creationDate) {
      return 1;
    }
    return 0;
  }

/*   isToday(date) {
    const today = new Date();
  
    // 👇️ Today's date
    console.log(today);
  
    if (today.toDateString() === date.toDateString()) {
      return true;
    }
  
    return false;
  } */

/* 
  getFormattedThreadCreationDates(thread: any) {
    for (let i = 0; i < this.channelThreads.length; i++) {
      let message = this.channelThreads[i];

      let timestamp = message['creationDate'];
      const date = new Date(timestamp);
      const formattedDate = date.toLocaleDateString('fr-CH', { day: 'numeric', month: 'numeric', year: 'numeric' });

      message['creationDate'] = formattedDate;

      if(!this.threadCreationDates.includes(formattedDate)) {
        this.threadCreationDates.push(formattedDate);
      }
    }
    this.threadCreationDates.sort(function(b, a) {
      return b - a;
    });
    console.log('Sorted thread creation dates array', this.threadCreationDates);
  }  */

  getThreadCreationDates() {
    for (let i = 0; i < this.channelThreads.length; i++) {
      let message = this.channelThreads[i];

      //const timestamp = message['creationDate'];
      //const date = new Date(timestamp);
      //const formattedDate = date.toLocaleDateString('fr-CH', { day: 'numeric', month: 'numeric', year: 'numeric' });

      if(!this.threadCreationDates.includes(message['creationDate'])) {
        this.threadCreationDates.push(message['creationDate']);
      }
    }
    this.threadCreationDates.sort(function(b, a) {
      return b - a;
    });
    console.log('Sorted thread creation dates array', this.threadCreationDates);
  } 

  /*   getCurrentDirectMessage() {
    if(this.channel = []) {
      this.showChannel = false;
      this.getCurrentDmUser();
    }
  } */

  /* ======================================================== */

  /* ================== MAIN ACHT DM DATA ================== */
/*   getCurrentDmUser() {
    const q = query(collection(db, 'users'));
    console.log('Querry users colelction', q);

    return onSnapshot(q, (list) => {
      this.dmUser = [];
      list.forEach(element => {
        this.dmUser.push(element.data());

        const dmq = query(collection(db, element.data()["directMessages"]));
        console.log('subcollection direct messages', dmq);
         return onSnapshot(dmq, (list) => {
          list.forEach(dmElement => {
            if(dmElement.data()["isActive"] == true) {
              this.dmUser.push(element.data());
            }
          });
        })
      });

      console.log('DM user data', this.dmUser);
    }); 
  } */

  /* ======================================================== */

  /* ================== MAIN CHAT OTHER FUNCTIONS ================== */
  toggleDialog(dialog: string) {
    if (dialog == 'addMember') {
      if (this.addMemberDialogOpen == false) {
        this.addMemberDialogOpen = true;
      } else {
        this.addMemberDialogOpen = false;
      }
    } else if (dialog == 'channelEdition') {
      if (this.channelEditionDialogOpen == false) {
        this.channelEditionDialogOpen = true;
      } else {
        this.channelEditionDialogOpen = false;
      }
    } else if (dialog == 'showMembers') {
      if (this.showMembersDialogOpen == false) {
        this.showMembersDialogOpen = true;
      } else {
        this.showMembersDialogOpen = false;
      }
    }
  }

  closeDialog() {
    this.addMemberDialogOpen = false;
    this.channelEditionDialogOpen = false;
    this.showMembersDialogOpen = false;
  }

  doNotClose($event: any) {
    $event.stopPropagation();
  }

  setBoolean(dialogBoolen: boolean) {
    this.channelEditionDialogOpen = false;
    this.showMembersDialogOpen = false;
    this.addMemberDialogOpen = false;
  }

  switchToAddMembers(addMemberDialogOpen: boolean) {
    this.addMemberDialogOpen = true;
  }

  addReaction(emoji: string) {

  }

  openMoreEmojis() {

  }

  moreOptions() {
    this.editMessagePopupOpen = true;
  }

  editMessage() {
    this.editMessagePopupOpen = false;
    this.ownMessageEdit = true;
  }

  closeEditedMessage() {
    this.ownMessageEdit = false;
  }

  saveEditedMessage() {
    // 
  }

  openThread(): void {
    this.chatService.openThread();
  }

  getThreadOpenStatus(): void {
    this.subscription.add(this.chatService.threadOpen$.subscribe(open => {
      this.threadOpen = open;
    }));
  }

  subscribeToThreads(): void {
    this.subscription.add(
      this.chatService.threads$.subscribe(threads => {
        this.threads = threads;
      })
    );
  }
}
