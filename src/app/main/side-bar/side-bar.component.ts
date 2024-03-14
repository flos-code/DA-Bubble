import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DialogAddChannelComponent } from './dialog-add-channel/dialog-add-channel.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddUserNewChannelComponent } from './dialog-add-user-new-channel/dialog-add-user-new-channel.component';
import { ViewManagementService } from '../../services/view-management.service';
import { UserManagementService } from '../../services/user-management.service';
import { ChatService } from '../../services/chat.service';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  onSnapshot,
  updateDoc,
  doc,
  addDoc,
  getDoc,
} from 'firebase/firestore';
import { Channel } from '../../../models/channel.class';
import { getAuth } from 'firebase/auth';
import { Observable, Subscription } from 'rxjs';

const firebaseConfig = {
  apiKey: 'AIzaSyC520Za3P8qTUGvWM0KxuYqGIMaz-Vd48k',
  authDomain: 'da-bubble-87fea.firebaseapp.com',
  projectId: 'da-bubble-87fea',
  storageBucket: 'da-bubble-87fea.appspot.com',
  messagingSenderId: '970901942782',
  appId: '1:970901942782:web:56b67253649b6206f290af',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [
    MatIconModule,
    CommonModule,
    DialogAddChannelComponent,
    DialogAddUserNewChannelComponent,
  ],
  templateUrl: './side-bar.component.html',
  styleUrls: [
    './side-bar.component.scss',
    './side-bar.component-mediaquery.scss',
  ],
})
export class SideBarComponent {
  workspaceVisible: boolean = true;
  channelsVisible: boolean = true;
  usersVisible: boolean = true;
  dialogAddChannelVisible: boolean = false;
  dialogAddUserVisible: boolean = false;

  selectedChannel: string | null = null;
  selectedUserId: number | null = null;
  channels$: Observable<{ id: string; data: Channel }[]>;
  channels: { id: string; data: Channel }[] = [];
  users$ = this.userManagementService.users$;
  filteredUsers$ = this.userManagementService.filteredUsers$;
  screenSize: string;
  newChannelId: string;
  private screenSizeSubscription: Subscription;
  private subscription = new Subscription();

  authSubscription: any;
  auth = getAuth(app);

  constructor(
    public dialog: MatDialog,
    public viewManagementService: ViewManagementService,
    public userManagementService: UserManagementService,
    private chatService: ChatService
  ) {}

  async ngOnInit() {
    this.userManagementService.activeUserId$.subscribe((activeUserId) => {
      if (activeUserId) {
        this.channels$ = this.loadChannels(activeUserId);
      }
    });
    this.userManagementService.loadUsers();
    this.viewManagementService.setView('sidebar');

    this.screenSizeSubscription =
      this.viewManagementService.screenSize$.subscribe((size) => {
        this.screenSize = size;

        this.preSelect(this.screenSize);
      });

    this.subscription.add(
      this.viewManagementService.showSidebarToggle$.subscribe((value) => {
        this.workspaceVisible = value;
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.screenSizeSubscription.unsubscribe();
  }

  toggleSection(section: string): void {
    if (section === 'channels') {
      this.channelsVisible = !this.channelsVisible;
    } else if (section === 'users') {
      this.usersVisible = !this.usersVisible;
    } else if (section === 'workspace') {
      this.workspaceVisible = !this.workspaceVisible;
      if (this.workspaceVisible) {
        this.viewManagementService.setView('sidebar');
      }
    }
  }

  toggleAddChannelDialog() {
    this.dialogAddChannelVisible = !this.dialogAddChannelVisible;
  }

  toggleAddUserDialog() {
    this.dialogAddUserVisible = !this.dialogAddUserVisible;
  }

  hideAddChannelDialog() {
    this.dialogAddChannelVisible = false;
    this.setActiveChannel(this.newChannelId);
  }

  async openNewMessage() {
    this.chatService.setActiveChannelId(null);
    this.chatService.setSelectedUserId(null);
    this.viewManagementService.setView('newMessage');
  }

  loadChannels(
    activeUserId: string
  ): Observable<{ id: string; data: Channel }[]> {
    const channelsCol = collection(db, 'channels');
    console.log('Active User ID wegen filter:', activeUserId);

    // Erstellen Sie ein neues Observable
    return new Observable<{ id: string; data: Channel }[]>((subscriber) => {
      const unsubscribe = onSnapshot(
        channelsCol,
        (snapshot) => {
          const channels = snapshot.docs
            .map((doc) => ({
              id: doc.id,
              data: new Channel(doc.data()),
            }))
            .filter((channel) => channel.data.members.includes(activeUserId))
            .sort((a, b) => a.data.creationDate - b.data.creationDate);
          subscriber.next(channels);
        },
        (error) => {
          subscriber.error(error);
        }
      );

      // Rückgabe einer Cleanup-Funktion, die beim Unsubscribe aufgerufen wird
      return () => unsubscribe();
    });
  }

  async addChannelToFirestore(
    channel: Channel,
    activeUserId: string
  ): Promise<void> {
    try {
      const channelData = channel.toJSON();
      // Füge den neuen Kanal hinzu
      const docRef = await addDoc(collection(db, 'channels'), {
        ...channelData,
      });

      await this.loadChannels(activeUserId); // Lade Kanäle neu, um die UI zu aktualisieren

      if (this.screenSize === 'medium' || this.screenSize === 'large') {
        this.setActiveChannel(docRef.id); //bei mobile muss dan anderest geregelt werden wegen view mangement um noch user hinzuzufügen
        this.newChannelId = docRef.id;
      } else {
        this.newChannelId = docRef.id;
        console.log('new id in sidebar ', this.newChannelId);
      }
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Kanals: ', error);
    }
  }

  async handleChannelCreationAndToggleDialog(channelData: {
    name: string;
    description: string;
  }): Promise<void> {
    await this.handleChannelCreation(channelData);
    this.toggleAddUserDialog();
  }

  async handleChannelCreation(channelData: {
    name: string;
    description: string;
  }): Promise<void> {
    let activeUserId = this.userManagementService.activeUserId.getValue();
    let newChannel = new Channel({
      name: channelData.name,
      description: channelData.description,
      createdBy: activeUserId, // Setze den aktuellen Benutzer als Ersteller
      creationDate: Date.now(),
      type: 'channel',
      members: [activeUserId],
    });

    this.addChannelToFirestore(newChannel, activeUserId);
  }

  async onUsersToAdd({
    all,
    userIds,
  }: {
    all: boolean;
    userIds?: string[];
  }): Promise<void> {
    // const selectedChannelId = await this.getActiveChannelId();
    const selectedChannelId = this.newChannelId;

    if (!selectedChannelId) {
      console.error('Kein aktiver Kanal ausgewählt.');
      return; // Frühzeitige Rückkehr, wenn kein aktiver Kanal gefunden wurde
    }

    let membersToUpdate: string[] = [];

    if (all) {
      // Füge alle Benutzer-IDs hinzu, wenn 'all' wahr ist
      const allUsersSnapshot = await getDocs(collection(db, 'users'));
      allUsersSnapshot.forEach((doc) => membersToUpdate.push(doc.id));
    } else if (userIds) {
      // Füge nur die spezifisch ausgewählten Benutzer-IDs hinzu
      membersToUpdate = userIds;
    }

    // Aktualisiere das 'members'-Array des aktiven Kanals
    const channelRef = doc(db, 'channels', selectedChannelId);
    const channelSnap = await getDoc(channelRef);
    if (channelSnap.exists()) {
      const existingMembers = channelSnap.data()['members'] || [];
      const updatedMembers = Array.from(
        new Set([...existingMembers, ...membersToUpdate])
      ); // Kombiniert und entfernt Duplikate
      await updateDoc(channelRef, { members: updatedMembers });
    }
  }

  setActiveChannel(channelId: string) {
    if (this.getActiveChannelId() !== channelId) {
      // Close the thread if the clicked channel is not the currently active channel
      this.chatService.closeThread();
      // Now set the clicked channel as the active channel
      this.chatService.setActiveChannelId(channelId);
      // Show the main chat view for the newly selected channel
      this.viewManagementService.setView('channel');
    } else {
      console.log('Clicked channel is already active.');
    }
  }

  getActiveChannelId() {
    return this.chatService.getActiveChannelId();
  }

  setSelectedUser(userId: string) {
    this.chatService.setSelectedUserId(userId);
    this.viewManagementService.setView('directMessage');
  }

  getSelectedUserId() {
    return this.chatService.getSelectedUserId();
  }

  preSelect(screenSize: string) {
    if (screenSize === 'medium' || screenSize === 'large') {
      this.setActiveChannel('allgemein');
    }
  }
}
