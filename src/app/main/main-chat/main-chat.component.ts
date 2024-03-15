import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { Thread } from '../../../models/thread.class';
import { ThreadComponent } from './thread/thread.component';
import { UserManagementService } from '../../services/user-management.service';
import { TextBoxComponent } from '../new-message/text-box/text-box.component';
import { ProfilecardsOtherUsersComponent } from './show-members-dialog/profilecards-other-users/profilecards-other-users.component';

/* ========== FIREBASE ============ */
import { initializeApp } from 'firebase/app';
import { collection, doc, getDoc, getFirestore, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { environment } from '../../../environments/environment.development';
const app = initializeApp(environment.firebase);
const db = getFirestore(app);
/* =============================== */

@Component({
  selector: 'app-main-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, ReactiveFormsModule, MatFormFieldModule,
    ChannelEditionDialogComponent, ShowMembersDialogComponent, AddMembersDialogComponent, SecondaryChatComponent, ThreadComponent,TextBoxComponent, ProfilecardsOtherUsersComponent],
  templateUrl: './main-chat.component.html',
  styleUrl: './main-chat.component.scss'
})

export class MainChatComponent implements OnInit, OnDestroy {
  /* ========== MAIN VARIABLES ========== */
  @ViewChild('mainChat') private mainChat: ElementRef;

  dmMessagesPath = '';
  channelThreadsPath = '';
  channelPath = '';

  channel: Channel; // Daten des aktuellen Channels
  activeChannelId: string;
  //activeChannelId: string = null;
  activeChannelSub: Subscription = new Subscription();

  currentUser: string = 'OS9ntlBZdogfRKDdbni6eZ9yop93';
  //currentUser: string = 'OS9ntlBZdogfRKDdbni6eZ9yop93';
  currentUserSub: Subscription = new Subscription();

  dmMessages = [];
  activeDmUser: string;
  //activeDmUser: string = 'n2gxPYqotIhMceOiDdUSv6Chkiu1';
  activeDmUserData: any;
  activeDmUserName: string = 'Tobias Odermatt';
  //activeDmUserStatus: string = '';
  activeDmUserSub: Subscription = new Subscription();

  channelMembers = []; // Alle Userdaten der Mitglieder des Channels
  //members = ["n2gxPYqotIhMceOiDdUSv6Chkiu1", "OS9ntlBZdogfRKDdbni6eZ9yop93", "mJzF8qGauLVZD6ikgG4YS7LXYF22", "gdP2EbmSmMT1CBHW6XDS6TJH1Ou2", "Yic168FhfjbDhxyTsATeQttU3xD2"];
  channelThreads = []; // Alle Threads des Channels
  channelThreadsDateTime = []; // Hilfsarray mit spezifischen Feldern um die Threads anzuzeigen.
  threadCreationDates = []; // Einfaches Array mit den Erstelldaten der Threads z.B. "21.02.2024"
  threadId: string = '';

  textArea: string = "";
  typeChannel: boolean = true;
  addMemberDialogOpen: boolean = false;
  channelEditionDialogOpen: boolean = false;
  showMembersDialogOpen: boolean = false;
  editMessagePopupOpen: boolean = false;
  ownMessageEdit: boolean = false;
  showProfileCard: boolean = false
  /* ============================================= */
  channelCreatorName: string;
  /* ========== SECONDARY CHAT VARIABLES========== */
  subscription: Subscription = new Subscription();
  threadOpen: boolean = false;
  threads: Thread[] = [];
  newMember: string = "";
  newMemberObject = {
    'userId': 'ikeikeoie',
    'name': this.newMember,
    'surname': 'M.',
    'photo': '../../../assets/img/main-chat/member2.svg'
  };
  /* ============================================== */

  constructor(public chatService: ChatService, private userManagementService: UserManagementService) {
    this.currentUserSub = userManagementService.activeUserId$.subscribe((value) => {
      if(value) {
        this.currentUser = value;
        console.log('CURRENT USER', this.currentUser);
      }
    });

    this.activeChannelSub = chatService.activeChannelIdUpdates.subscribe((valueChannel) => {
      if(valueChannel !== null) {
        this.activeChannelId = valueChannel;
        this.activeDmUser = null;
        console.log('ACITVE CHANNEL ID', this.activeChannelId);
        this.getChannelAndDmPath();
        this.channelPath = this.channelThreadsPath;
        this.loadChannelData();
        setTimeout(() => {
          this.scrollToBottom();
        }, 500);
      }
    });
      
    this.activeDmUserSub = chatService.activeUserIdUpdates.subscribe((valueDm) => {
      if(valueDm !== null) {
        this.activeDmUser = valueDm;
        this.activeChannelId = null;
        console.log('ACITVE DM USER', this.activeDmUser);
        this.getChannelAndDmPath();
        this.channelPath = this.dmMessagesPath;
        this.loadDmData();
        setTimeout(() => {
          this.scrollToBottom();
        }, 800);  
      }
    });

  }

  ngOnInit(): void {
/*     this.currentUserSub = this.userManagementService.activeUserId$.subscribe((value) => {
      if(value) {
        this.currentUser = value;
        console.log('CURRENT USER', this.currentUser);

        this.activeChannelSub = this.chatService.activeChannelIdUpdates.subscribe((valueChannel) => {
          if(valueChannel !== null) {
            this.activeChannelId = valueChannel;
            this.activeDmUser = null;
            console.log('ACITVE CHANNEL ID', this.activeChannelId);
            this.getChannelAndDmPath();
            this.channelPath = this.channelThreadsPath;
            this.loadChannelData();
            setTimeout(() => {
              this.scrollToBottom();
            }, 800);
          }
        });
    
        this.activeDmUserSub = this.chatService.activeUserIdUpdates.subscribe((valueDm) => {
          if(valueDm !== null) {
            this.activeDmUser = valueDm;
            this.activeChannelId = null;
            console.log('ACITVE DM USER', this.activeDmUser);
            this.getChannelAndDmPath();
            this.channelPath = this.dmMessagesPath;
            this.loadDmData();
            setTimeout(() => {
              this.scrollToBottom();
            }, 800);  
          }
        });
      }
      }
    ); */
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.activeChannelSub.unsubscribe();
    this.currentUserSub.unsubscribe();
    this.activeDmUserSub.unsubscribe();
  }

  /* ================== ID's FOM SERVICE ================== */
  getChannelAndDmPath() {
    this.dmMessagesPath = `users/${this.currentUser}/allDirectMessages/${this.activeDmUser}/directMessages`;
    this.channelThreadsPath = `channels/${this.activeChannelId}/threads`;
  }

  async fetchChannelCreatorName(userId: string): Promise<string> {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data()['name'] || 'Unbekannt';
    }
    return 'Unbekannt';
  }

  /* ================== MAIN CHAT CHANNEL DATA ================== */
  loadChannelData() {
    this.getCurrentChannel();
    this.getThreadOpenStatus();
    this.subscribeToThreads();
  }

  loadDmData() {
    this.getDmUser();
  }

  getCurrentChannel() {
    onSnapshot(doc(collection(db, 'channels'), this.activeChannelId), (doc) => {
      this.channel = new Channel(doc.data());
      setTimeout(() => {
        this.getMembers();
      }, 200);
      setTimeout(() => {
        this.getThreads();
      }, 400);
      if (this.channel?.createdBy) {
        this.fetchChannelCreatorName(this.channel.createdBy).then(name => {
          this.channelCreatorName = name;
          console.log('Kanal wurde erstellt von:', name);
        });
      }
    });
  }

  getMembers() {
      const q = query(collection(db, 'users'));
      return onSnapshot(q, (list) => {
        this.channelMembers = [];
        list.forEach(element => {
          if(this.channel['members'].includes(element.id)) {
            this.channelMembers.push(element.data());
          }    
        });
    });
  }

  getThreads() {
    const q = query(collection(db, this.channelPath), orderBy("creationDate", "asc"), limit(20));
    // const q = query(collection(db, `channels/${this.activeChannelId}/threads`), orderBy("creationDate", "asc"), limit(20));
    return onSnapshot(q, (list) => {
      this.channelThreads = [];
      list.forEach(thread => {
          this.channelThreads.push(thread.data());
        }
      )
      this.sortChannelThreadsArray(this.channelThreads);
      this.getThreadCreationDates(this.channelThreads);
    });
  }

  getDmUser() {
    onSnapshot(doc(collection(db, 'users'), this.activeDmUser), (dmUser) => {
      this.activeDmUserData = dmUser.data();
      this.getDmUserName(dmUser.id);
      setTimeout(() => {
        this.getCurrentDmUserMessages();
      }, 200);

    });
  }

  getUserName(userId: string): string {
    const user = this.channelMembers.find(member => member.userId === userId);
    return user ? user.name : 'Unbekannter Benutzer';
  }
  

  getCurrentDmUserMessages() {
      const q = query(collection(db, this.dmMessagesPath), orderBy("creationDate", "asc"), limit(20));
      // const q = query(collection(db, `channels/${this.activeChannelId}/threads`), orderBy("creationDate", "asc"), limit(20));
      return onSnapshot(q, (list) => {
        this.dmMessages = [];
        list.forEach(dmMessage => {
            this.dmMessages.push(dmMessage.data());
          }
        )
        this.sortChannelThreadsArray(this.dmMessages);
        this.getThreadCreationDates(this.dmMessages);
      });
    }


  async getDmUserName(userId: string) {
    this.activeDmUserName = ""; 
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);   
    this.activeDmUserName = docSnap.data()['name']; 
    //this.activeDmUserStatus = docSnap.data()['isOnline'];
  }

  sortChannelThreadsArray(threadsOrDms: any) {
    threadsOrDms.sort(this.compareByCreationDate);
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

  getThreadCreationDates(threadsOrDms: any) {
    this.channelThreadsDateTime = [];
    this.threadCreationDates = [];
    for (let i = 0; i < threadsOrDms.length; i++) {
      let message = threadsOrDms[i];
      let creationDate = message['creationDate'];
      let userId = message['createdBy'];
      let formattedDate = this.formattedDate(creationDate);
      let formattedDateTimeSeparator = this.getTimeSeparatorDate(creationDate);
      let formattedTime = this.getFormattedTime(creationDate);
      let createdBy = this.getUserCreated(userId);
      let imageUrl = message['imageUrl'] || null;

      this.channelThreadsDateTime.push({
        'threadId': message['messageId'],
        'timestamp': message['creationDate'],
        'dateString': formattedDate,
        'timeSeparatorDate': formattedDateTimeSeparator,
        'time': formattedTime,
        'message': threadsOrDms[i]['message'],
        'userId': userId,
        'createdBy': createdBy,
        'imgUrl': this.getImgUrl(userId)
      });
     
      if(!this.threadCreationDates.some(date => date.dateString === formattedDate)) {
        this.threadCreationDates.push({
          'dateString': formattedDate,
          'timeSeparatorDate': formattedDateTimeSeparator,
        });
      }
    }
    this.threadCreationDates.sort(this.compareByCreationDate);
    this.channelThreadsDateTime.sort(this.compareByCreationDate);
  } 

  formattedDate(creationDate: any) {
    const day = new Date(creationDate).toLocaleDateString('fr-CH', { day: 'numeric'});
    const month = new Date(creationDate).toLocaleDateString('fr-CH', { month: 'numeric'});
    const year = new Date(creationDate).toLocaleDateString('fr-CH', { year: 'numeric'});
    return `${day}.${month}.${year}`;
  }

  getTimeSeparatorDate(creationDate: any) {
    let dateToday = new Date();
    const dateTodayUnix = dateToday.getTime();
    let convertedDate = this.formattedDateTimeSeparator(dateTodayUnix);
    creationDate = this.formattedDateTimeSeparator(creationDate);

    if(convertedDate == creationDate){
      return 'Heute';
    } else {
      return creationDate;
    }
  }

  formattedDateTimeSeparator(date: any) {
    const weekday = new Date(date).toLocaleDateString('de-DE', { weekday: 'long' });
    const day = new Date(date).toLocaleDateString('fr-CH', { day: 'numeric'});
    const month = new Date(date).toLocaleDateString('de-DE', { month: 'long'});
    return `${weekday}, ${day} ${month}`;
  }

  getFormattedTime(creationDate: number) {
    const getString = (number) => number < 10 ? '0' + number : String(number);
    const getTime = (creationDate: number) => {
        const date = new Date(creationDate);
        const hours = getString(date.getHours());
        const minutes = getString(date.getMinutes());
        return `${hours}:${minutes}`;
    };
    return getTime(creationDate);
  }

  getUserCreated(userId: string) {
    let user = ""; 
    for (let i = 0; i < this.channelMembers.length; i++) {
      const userCreated = this.channelMembers[i];
      if(userId == userCreated['id']) {
        user = userCreated['name'];
      }
    }
    return user;
  }

  getImgUrl(userId) {
    for (let i = 0; i < this.channelMembers.length; i++) {
      const user = this.channelMembers[i];
      if(userId == user.id) {
        return user.imgUrl;
      }
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      this.mainChat.nativeElement.scroll({
        top: this.mainChat.nativeElement.scrollHeight,
        left: 0,
        behavior: 'smooth'
      });
    }, 100)
  } 

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

  sendMessage() {
    this.scrollToBottom();
  }

  openThread(threadId: string): void {
    this.chatService.openThread(threadId);
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

  openProfileCard() {
    this.showProfileCard = true;
  }

  closeProfileCard(closeProfileCard: boolean) {
    this.showProfileCard = false;
  }
}
