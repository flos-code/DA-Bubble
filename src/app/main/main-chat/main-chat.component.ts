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

import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot,  limit, query, doc, getDoc, updateDoc, orderBy } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
import { Router } from '@angular/router';
import { Channel } from '../../../models/channel.class';
import { OverlayOutsideClickDispatcher } from '@angular/cdk/overlay';
import { Message } from '../../../models/message.class';
import { Thread } from '../../../models/thread.class';

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

export interface Fruit {
  name: string;
}

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

  channelMessages: Message[] = [];
  messageId: string = '';
  messageCreationDates: number[] = [];

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

 @Input() channels = [{
    'id': 'sijfef8e8',
    'name': 'Entwicklerteam',
    'members': [{
      'userId': 'sadf123sadf',
      'name': 'Tobias',
      'surname': 'Odermatt',
      'photo': '../../../assets/img/main-chat/member1.svg'
    },
    {
      'userId': 'iej896sdf',
      'name': 'Pierce',
      'surname': 'C.',
      'photo': '../../../assets/img/main-chat/member2.svg'
    },
    {
      'userId': 'sadmvkui25ddf',
      'name': 'Filip',
      'surname': 'Todoroski',
      'photo': '../../../assets/img/main-chat/member3.svg'
    }
    ],
    'messages': [{
      'from': 'sadf123sadf',
      'createDate': '10.02.2024',
      'message': 'Hallo Zusammen, ich habe ein Frage zu Angular',
      'threads': [{ 'message': 'Was für eine Frage hast du genau?' }],
      'reactions': [{ 'reactedBy': 'sadmvkui25ddf', 'ractionName': 'rocket', 'iconPath': '../../../assets/img/main-chat/arrowDownDefault.svg' }]
    }]
  }]; 

  users = [{
    'userId': 'sadmvkui25ddf',
    'name': 'Filip',
    'surname': 'Todoroski',
    'photo': '../../../assets/img/main-chat/member1.svg',
    'onlineStatus': 'online'
  },
  {
    'userId': 'sadf123sadf',
    'name': 'Tobias',
    'surname': 'Odermatt',
    'photo': '../../../assets/img/main-chat/member2.svg',
    'onlineStatus': 'idle'
  },
  {
    'userId': 'iej896sdf',
    'name': 'Pierce',
    'surname': 'C.',
    'photo': '../../../assets/img/main-chat/member3.svg',
    'onlineStatus': 'busy'
  },
  {
    'userId': 'okokloilk366',
    'name': 'Pascal',
    'surname': 'M.',
    'photo': '../../../assets/img/main-chat/member1.svg',
    'onlineStatus': 'away'
  },
  {
    'userId': 'sadfsadf8585',
    'name': 'Florian',
    'surname': 'Scholz',
    'photo': '../../../assets/img/main-chat/member2.svg',
    'onlineStatus': 'online'
  },
  ];

  constructor(private chatService: ChatService) { }

  ngOnInit(): void {
    this.getCurrentChannel();
    this.getMessages();
    this.getThreadOpenStatus();
    //this.getCurrentDirectMessage();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /* ================== Main chat channel data ================== */
  getCurrentChannel() {
    // => nicht in ein array pushen!! => channel = new Channel();
    onSnapshot(doc(collection(db, 'channels'), this.channelId), (doc) => {
      //this.channel = [];
      this.channel = new Channel(doc.data());
      //this.channel.push(new Channel(doc.data()));
      console.log('Channel data', this.channel);
    });
  }

  getMessages() {
    //const q = query(collection(db, `channels'/${this.channelId}/messages`));
    const q = query(collection(db, 'channels/allgemein/messages'), orderBy("creationDate", "asc"));
    return onSnapshot(q, (list) => {
      this.channelMessages = [];
      list.forEach(message => {
          this.channelMessages.push(new Message(message.data()));
          console.log('Channel messages data', this.channelMessages);
          this.getMessageCreationDates();
        })
    });
  }

  getMessageCreationDates() {
    for (let i = 0; i < this.channelMessages.length; i++) {
      let message = this.channelMessages[i];
      //let date = new Date(message['creationDate']);
     // date = date.toLocaleDateString('de-CH');

      if(!this.messageCreationDates.includes(message['creationDate'])) {
        let date = new Date(message['creationDate']);
        this.messageCreationDates.push(message.creationDate);
      }
    }
    console.log(this.messageCreationDates);
    console.log('Current date', Date.now());
  }  


  //const messages = snapshot.docs.map(doc => new Message({ ...doc.data(), messageId: doc.id })).orderBy();


/*   getCurrentDirectMessage() {
    if(this.channel = []) {
      this.showChannel = false;
      this.getCurrentDmUser();
    }
  } */

  /* ======================================================== */

  /* ================== Main chat DM data ================== */
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
}
