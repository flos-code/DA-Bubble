import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
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
import { Firestore, collection, doc, getDoc, limit, onSnapshot, orderBy, query } from '@angular/fire/firestore';

@Component({
  selector: 'app-main-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, ReactiveFormsModule, MatFormFieldModule,
    ChannelEditionDialogComponent, ShowMembersDialogComponent, AddMembersDialogComponent, SecondaryChatComponent, ThreadComponent,TextBoxComponent, ProfilecardsOtherUsersComponent],
  templateUrl: './main-chat.component.html',
  styleUrl: './main-chat.component.scss'
})

export class MainChatComponent implements OnInit, OnDestroy {
  private firestore: Firestore = inject(Firestore);
  @ViewChild('mainChat') private mainChat: ElementRef;
  dmMessagesPath = '';
  channelThreadsPath = '';
  path = '';

  channel: Channel; // Daten des aktuellen Channels
  activeChannelId: string;
  activeChannelSub: Subscription = new Subscription();
  currentUser: string;
  currentUserData: any;
  currentUserSub: Subscription = new Subscription();
  dmMessages = [];
  activeDmUser: string;
  activeDmUserData: any;
  activeDmUserName: string;
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
  channelCreatorName: string;
  desktopView: boolean = true;

  subscription: Subscription = new Subscription();
  threadOpen: boolean = false;
  threads: Thread[] = [];
/*   newMember: string = "";
  newMemberObject = {
    'userId': 'ikeikeoie',
    'name': this.newMember,
    'surname': 'M.',
    'photo': '../../../assets/img/main-chat/member2.svg'
  };
 */
  constructor(public chatService: ChatService, private userManagementService: UserManagementService) {
    this.currentUserSub = userManagementService.activeUserId$.subscribe((value) => {
      if(value) {
        this.currentUser = value;
      }
    });

    this.activeChannelSub = chatService.activeChannelIdUpdates.subscribe((valueChannel) => {
      if(valueChannel !== null) {
        this.activeChannelId = valueChannel;
        this.activeDmUser = null;
        this.getChannelAndDmPath();
        this.path = this.channelThreadsPath;
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
        this.getChannelAndDmPath();
        this.path = this.dmMessagesPath;
        this.loadDmData();
        setTimeout(() => {
          this.scrollToBottom();
        }, 800);  
      }
    });
  }

  ngOnInit(): void { 
    this.setMobileViewComponents();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.activeChannelSub.unsubscribe();
    this.currentUserSub.unsubscribe();
    this.activeDmUserSub.unsubscribe();
  }
  
  /**
  *
  * Sets the boolean values of variables to ture, if the screensize is smaller or equal to 500px.
  */
  setMobileViewComponents() {
    if(window.innerWidth <= 500) {
      this.desktopView = false;
    } else {
      this.desktopView = true;
    }
  }
  
  /* ================== ID's FOM SERVICE ================== */
  /**
  * Sets the path to the correct subcollection within the channels and users collection.
  */
  getChannelAndDmPath() {
    this.dmMessagesPath = `users/${this.currentUser}/allDirectMessages/${this.activeDmUser}/directMessages`;
    this.channelThreadsPath = `channels/${this.activeChannelId}/threads`;
  }

  /**
   * Retruns the name of the user that has created the acitve channel.
   * @param userId - id of the user that created the channel
   * @returns 
   */
  async fetchChannelCreatorName(userId: string): Promise<string> {
    const userRef = doc(this.firestore, "users", userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data()['name'] || 'Unbekannt';
    }
    return 'Unbekannt';
  }

  /* ================== MAIN CHAT CHANNEL DATA ================== */
  /**
   * Runs all the function to fetch the data for the active channel.
   */
  loadChannelData() {
    this.getcurrentUserData();
    this.getCurrentChannel();
    this.getThreadOpenStatus();
    this.subscribeToThreads();
  }

  /**
   * Runs all the function to fetch the data for the active direct message.
   */
  loadDmData() {
    this.getcurrentUserData();
    this.getDmUser();
  }

  /**
   * Fetches the active Channel object and runs the getMembers and getThreads function.
   */
  getCurrentChannel() {
    onSnapshot(doc(collection(this.firestore, 'channels'), this.activeChannelId), (doc) => {
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
        });
      }
    });
  }

  /**
   * Fetches the data for every channel member an stores them in the channelMembers array.
   * @returns 
   */
  getMembers() {
      const q = query(collection(this.firestore, 'users'));
      return onSnapshot(q, (list) => {
        this.channelMembers = [];
        list.forEach(element => {
          if(this.channel['members'].includes(element.id)) {
            this.channelMembers.push(element.data());
          }    
        });
        this.sortChannelMembers();
    });
  }

  /**
   * Sorts the channelMembers array so that the current user is at the first position.
   */
  sortChannelMembers() {
    if(this.channelMembers.some(member => member.id == this.currentUser)) {
      let memberTofind = this.channelMembers.find(memObj => memObj.id == this.currentUser);
      let index = this.channelMembers.findIndex(memb => memb.id == this.currentUser);
      this.channelMembers.splice(index, 1);
      this.channelMembers.unshift(memberTofind);  
    }
  }

  /**
   * Fetches the data for every thread an stores them in the channelThreads array.
   * @returns 
   */
  getThreads() {
    const q = query(collection(this.firestore, this.path), orderBy("creationDate", "asc"), limit(20));
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

    /**
   * Returns the name of the selected dm user.
   * @param userId - id of the user of the selecte direct message
   */
    getcurrentUserData() {
      onSnapshot(doc(collection(this.firestore, 'users'), this.currentUser), (user) => {
        this.currentUserData = user.data();
      });
    }
  

  /**
   * Fetches the data of the user that is select in direct messages and sotres them in the activeDmUserData array.
   * @returns 
   */
  getDmUser() {
    onSnapshot(doc(collection(this.firestore, 'users'), this.activeDmUser), (dmUser) => {
      this.activeDmUserData = dmUser.data();
      this.getDmUserName(dmUser.id);
      setTimeout(() => {
        this.getCurrentDmUserMessages();
      }, 200);

    });
  }

/*   getUserName(userId: string): string {
    const user = this.channelMembers.find(member => member.userId === userId);
    return user ? user.name : 'Unbekannter Benutzer';
  } */
  
  /**
   * Fetches the data for every direct message an stores them in the dmMessages array.
   * @returns 
   */
  getCurrentDmUserMessages() {
      const q = query(collection(this.firestore, this.dmMessagesPath), orderBy("creationDate", "asc"), limit(20));
      return onSnapshot(q, (list) => {
        this.dmMessages = [];
        list.forEach(dmMessage => {
            this.dmMessages.push(dmMessage.data());
          }
        )
        this.sortChannelThreadsArray(this.dmMessages);
        this.getThreadCreationDates(this.dmMessages);
        console.log('Dm')
      });
    }

  /**
   * Returns the name of the selected dm user.
   * @param userId - id of the user of the selecte direct message
   */
  async getDmUserName(userId: string) {
    this.activeDmUserName = ""; 
    const docRef = doc(this.firestore, "users", userId);
    const docSnap = await getDoc(docRef);   
    this.activeDmUserName = docSnap.data()['name']; 
  }

  /**
   * Sorts the channelThreads or the dmMessages array.
   * @param threadsOrDms - array (channelThreads or dmMessages)
   */
  sortChannelThreadsArray(threadsOrDms: any) {
    threadsOrDms.sort(this.compareByCreationDate);
  }

  /**
   * Sorts the JSON array according to the creation date, ascending.
   * @param b - creationDate of the message
   * @param a - creationDate of the message
   * @returns 
   */
  compareByCreationDate(b: any, a: any) {
    if(b.creationDate < a.creationDate){
      return -1;
    }
    if(b.creationDate > a.creationDate) {
      return 1;
    }
    return 0;
  }

  /**
   * 
   * @param threadsOrDms - array (channelThreads or dmMessages)
   */
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
      //let createdBy = this.getUserCreated(userId);
      let imageUrl = message['imageUrl'] || null;

      this.channelThreadsDateTime.push({
        'threadId': message['messageId'],
        'timestamp': message['creationDate'],
        'dateString': formattedDate,
        'timeSeparatorDate': formattedDateTimeSeparator,
        'time': formattedTime,
        'message': threadsOrDms[i]['message'],
        'userId': userId,
        'createdBy': this.getUserCreated(userId),
        'imgUrl': this.getImgUrl(userId),
        'imageUrl': imageUrl
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

  /**
   * Formats the creation date of the thread to the defined format.
   * @param creationDate - thread creation date 
   * @returns 
   */
  formattedDate(creationDate: any) {
    const day = new Date(creationDate).toLocaleDateString('fr-CH', { day: 'numeric'});
    const month = new Date(creationDate).toLocaleDateString('fr-CH', { month: 'numeric'});
    const year = new Date(creationDate).toLocaleDateString('fr-CH', { year: 'numeric'});
    return `${day}.${month}.${year}`;
  }

  /**
   * Returns the formatted date of the tiem separator in the main chat an checks if the creation date is today.
   * If the creation date ist today, it returns "Heute".
   * @param creationDate - thred creation date
   * @returns 
   */
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

  /**
   * Formats the date of the time separator in the main chat to the defined format.
   * @param date - thred creation date
   * @returns 
   */
  formattedDateTimeSeparator(date: any) {
    const weekday = new Date(date).toLocaleDateString('de-DE', { weekday: 'long' });
    const day = new Date(date).toLocaleDateString('fr-CH', { day: 'numeric'});
    const month = new Date(date).toLocaleDateString('de-DE', { month: 'long'});
    return `${weekday}, ${day} ${month}`;
  }

  /**
   * Returns the time in "hh:mm" when the thread as been created.
   * @param creationDate - thread creation date
   * @returns 
   */
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

  /**
   * 
   * @param userId 
   * @returns 
   */
  getUserCreated(userId: string) {
    if(this.activeChannelId !== null){
      for (let i = 0; i < this.channelMembers.length; i++) {
        const userCreated = this.channelMembers[i];
        if(userId == userCreated['id']) {
          return userCreated['name'];
        }
      }
    } else {
      const q = query(collection(this.firestore, 'users'));
      onSnapshot(q, (list) => {
        list.forEach(element => {
          if(userId == element.id ) {
            return element.data()['name'];
          }  
        });
    });
    }
  }

  getImgUrl(userId) {
    if(this.activeChannelId !== null) {
      for (let i = 0; i < this.channelMembers.length; i++) {
        const user = this.channelMembers[i];
        if(userId == user.id) {
          return user.imgUrl;
        }
      }  
    } else {
      return this.currentUserData.imgUrl;
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
    this.channelEditionDialogOpen = false;
    this.showMembersDialogOpen = false;
    this.addMemberDialogOpen = false;
    this.desktopView = false;
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
