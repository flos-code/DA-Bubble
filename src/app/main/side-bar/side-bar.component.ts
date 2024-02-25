import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DialogAddChannelComponent } from './dialog-add-channel/dialog-add-channel.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddUserNewChannelComponent } from './dialog-add-user-new-channel/dialog-add-user-new-channel.component';
import { ViewManagementService } from '../../services/view-management.service';
import { ChatService } from '../../services/chat.service';
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
  serverTimestamp,
  setDoc,
  getDoc,
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
    private viewManagementService: ViewManagementService,
    private chatService: ChatService
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

  async  openNewMessage() {
    await this.deselect();
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

          // Optional: Schritt 3: Initialisiere die 'messages' Unter-Kollektion mit einem leeren Dokument, falls gewünscht
    // Hinweis: Dieser Schritt ist optional und hängt davon ab, ob Sie ein leeres Dokument in 'messages' beim Erstellen eines Kanals hinzufügen möchten.
    const messagesRef = collection(docRef, 'messages');
    await addDoc(messagesRef, {
      placeholder: true, // Markiere dieses Dokument als Platzhalter
      timestamp: serverTimestamp() // Optional: Firestore Server-Zeitstempel als Erstellungszeit

      

    });
    
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

 async handleChannelCreation(channelData: {
    name: string;
    description: string;
  }): Promise<void> {
    const currentUserSnapshot = await getDocs(query(collection(db, 'users'), where('isYou', '==', true)));
    let currentUserId = '';
    currentUserSnapshot.forEach(doc => {
      currentUserId = doc.id; // Nehmen wir an, es gibt nur einen solchen Benutzer
    });
  
    if (!currentUserId) {
      console.error('Kein Benutzer mit isYou = true gefunden');
      return;
    }

    let newChannel = new Channel({
      name: channelData.name,
      description: channelData.description,
      createdBy: currentUserId, // Setze den aktuellen Benutzer als Ersteller
      creationDate: Date.now(),
      isActive: true,
      type: 'channel',
      messages: [],
      members: [currentUserId],
    });

    this.addChannelToFirestore(newChannel);
  }

  async getActiveChannel() {
    const channelsCol = collection(db, 'channels');
    const querySnapshot = await getDocs(query(channelsCol, where('isActive', '==', true)));
    const activeChannelDocs = querySnapshot.docs;

    // Es sollte maximal einen aktiven Kanal geben
    if (activeChannelDocs.length > 0) {
        const activeChannel = activeChannelDocs[0];
        return activeChannel.id; // Gibt die ID des aktiven Kanals zurück
    } else {
        console.error("Kein aktiver Kanal gefunden.");
        return null; // Gibt null zurück, wenn kein aktiver Kanal gefunden wurde
    }
}


async onUsersToAdd({ all, userIds }: { all: boolean, userIds?: string[] }): Promise<void> {
  const selectedChannelId = await this.getActiveChannel();

  if (!selectedChannelId) {
      console.error("Kein aktiver Kanal ausgewählt.");
      return; // Frühzeitige Rückkehr, wenn kein aktiver Kanal gefunden wurde
  }

  let membersToUpdate: string[] = [];

  if (all) {
      // Füge alle Benutzer-IDs hinzu, wenn 'all' wahr ist
      const allUsersSnapshot = await getDocs(collection(db, 'users'));
      allUsersSnapshot.forEach(doc => membersToUpdate.push(doc.id));
  } else if (userIds) {
      // Füge nur die spezifisch ausgewählten Benutzer-IDs hinzu
      membersToUpdate = userIds;
  }

  // Aktualisiere das 'members'-Array des aktiven Kanals
  const channelRef = doc(db, 'channels', selectedChannelId);
  const channelSnap = await getDoc(channelRef);
  if (channelSnap.exists()) {
      const existingMembers = channelSnap.data()['members'] || [];
      const updatedMembers = Array.from(new Set([...existingMembers, ...membersToUpdate])); // Kombiniert und entfernt Duplikate
      await updateDoc(channelRef, { members: updatedMembers });
  }
}

setActiveChannel(channelId: string) {
  this.chatService.setActiveChannelId(channelId);
  this.chatService.getThreads(channelId, 'messageId');
}

getActiveChannelId() {
  return this.chatService.getActiveChannelId();
}
}
