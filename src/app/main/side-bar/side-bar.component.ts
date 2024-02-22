import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DialogAddChannelComponent } from './dialog-add-channel/dialog-add-channel.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddUserNewChannelComponent } from './dialog-add-user-new-channel/dialog-add-user-new-channel.component';
import { ViewManagementService } from '../../services/view-management.service';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  onSnapshot,
  updateDoc,
  doc,
  query,
  where,
  addDoc,
} from 'firebase/firestore';
import { Channel } from '../../../models/channel.class';
import { User } from '../../../models/user.class';

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

const newChannel = new Channel({
  name: 'Neuer Kanal',
  description: 'Beschreibung des neuen Kanals',
  createdBy: 'Benutzer-ID',
  creationDate: Date.now(),
  isActive: true,
});

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
  styleUrl: './side-bar.component.scss',
})
export class SideBarComponent {
  workspaceVisible: boolean = true;
  channelsVisible: boolean = true;
  usersVisible: boolean = true;
  dialogAddChannelVisible: boolean = false;
  dialogAddUserVisible: boolean = false;

  selectedChannel: string | null = null;
  selectedUserId: number | null = null;
  channels: { id: string; data: Channel }[] = [];
  users: { id: string; data: User }[] = [];

  constructor(
    public dialog: MatDialog,
    private viewManagementService: ViewManagementService
  ) {}

  async ngOnInit() {
    await this.loadChannels();
    await this.loadUsers();
  }

  sortUsers(): void {
    this.users.sort((a, b) => {
      return a.data.isYou === true ? -1 : b.data.isYou === true ? 1 : 0;
    });
  }

  toggleSection(section: string): void {
    if (section === 'channels') {
      this.channelsVisible = !this.channelsVisible;
    } else if (section === 'users') {
      this.usersVisible = !this.usersVisible;
    } else if (section === 'workspace') {
      this.workspaceVisible = !this.workspaceVisible;
    }
  }

  toggleAddChannelDialog() {
    this.dialogAddChannelVisible = !this.dialogAddChannelVisible;
  }

  toggleAddUserDialog() {
    this.dialogAddUserVisible = !this.dialogAddUserVisible;
  }

  openNewMessage() {
    this.selectedChannel = null;
    this.selectedUserId = null;
    this.showChat('showNewMessage');
  }

  async selectChannel(selectedChannelId: string): Promise<void> {
    await this.deselect();
    await updateDoc(doc(db, 'channels', selectedChannelId), { isActive: true });
    this.showChat('showMainChat');
  }

  async selectUser(selectedUserId: string): Promise<void> {
    await this.deselect();
    await updateDoc(doc(db, 'users', selectedUserId), { isSelected: true });
    this.showChat('showDms');
  }

  async deselect() {
    const channelSnapshot = await getDocs(collection(db, 'channels'));
    channelSnapshot.forEach(async (docSnapshot) => {
      await updateDoc(doc(db, 'channels', docSnapshot.id), { isActive: false });
    });

    const usersSnapshot = await getDocs(collection(db, 'users'));
    usersSnapshot.forEach(async (docSnapshot) => {
      await updateDoc(doc(db, 'users', docSnapshot.id), { isSelected: false });
    });
  }

  showChat(view: 'showMainChat' | 'showDms' | 'showNewMessage'): void {
    this.viewManagementService.changeView(view);
  }

  loadChannels(): void {
    const channelsCol = collection(db, 'channels');
    onSnapshot(channelsCol, (snapshot) => {
      // Zuerst die Kanäle in ein Array umwandeln
      let channels = snapshot.docs.map((doc) => ({
        id: doc.id,
        data: new Channel(doc.data()),
      }));

      // Kanäle basierend auf dem creationDate sortieren
      channels.sort((a, b) => a.data.creationDate - b.data.creationDate);

      // Die sortierten Kanäle dem 'channels'-Array zuweisen
      this.channels = channels;
    });
  }

  loadUsers(): void {
    const usersCol = collection(db, 'users');
    onSnapshot(usersCol, (snapshot) => {
      this.users = snapshot.docs.map((doc) => ({
        id: doc.id,
        data: new User(doc.data()),
      }));
      this.sortUsers();
    });
  }

  async addChannelToFirestore(channel: Channel): Promise<void> {
    try {
      // Schritt 1: aktuell aktiven chanel deaktivieren
      const activeChannelQuery = query(
        collection(db, 'channels'),
        where('isActive', '==', true)
      );
      const activeChannelsSnapshot = await getDocs(activeChannelQuery);
      activeChannelsSnapshot.forEach(async (docSnapshot) => {
        const channelRef = doc(db, 'channels', docSnapshot.id);
        await updateDoc(channelRef, { isActive: false });
      });

      // Schritt 2: Füge den neuen Kanal hinzu, setze isActive auf true
      const channelData = channel.toJSON();
      const docRef = await addDoc(collection(db, 'channels'), {
        ...channelData,
        isActive: true,
      });
      console.log('Dokument erfolgreich hinzugefügt mit ID: ', docRef.id);
      await this.loadChannels();
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Kanals: ', error);
    }
  }

  handleChannelCreationAndToggleDialog(channelData: {
    name: string;
    description: string;
  }): void {
    this.handleChannelCreation(channelData);
    this.toggleAddUserDialog();
  }

  handleChannelCreation(channelData: {
    name: string;
    description: string;
  }): void {
    let newChannel = new Channel({
      name: channelData.name,
      description: channelData.description,
      createdBy: 'UserID', // Hier sollten Sie die UserID des Erstellers setzen
      creationDate: Date.now(),
      isActive: true,
      type: 'channel',
      messages: [],
      members: [],
    });

    this.addChannelToFirestore(newChannel);
  }
}
