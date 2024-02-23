import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { initializeApp } from 'firebase/app';
import { collection, getDocs, getFirestore } from 'firebase/firestore';

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
  selector: 'app-dialog-add-user-new-channel',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './dialog-add-user-new-channel.component.html',
  styleUrl: './dialog-add-user-new-channel.component.scss',
})
export class DialogAddUserNewChannelComponent {
  @Input() isVisible: boolean = false;
  @Output() toggleVisibility = new EventEmitter<void>();
  @Output() usersToAdd = new EventEmitter<{ all: boolean, userIds?: string[] }>();
  @ViewChild('form') form!: NgForm;

  userSelection: string = 'allMembers';
  addedUser: string = 'test';
  allUsers = [/* Array von Benutzerobjekten mit { id: string, name: string } */];
  filteredUsers = [];
  selectedUsers = [];
  userInput: string = '';
  activeChannelMembers: string[] = [];

  constructor() {
    this.filterUsers();
  }

  ngOnInit() {
    this.initializeData();
  }

  toggle(): void {
    this.toggleVisibility.emit();
  }
  stopPropagation(event: MouseEvent) {
    event.stopPropagation();
  }

  addUser(): void {
    if (this.userSelection === 'allMembers') {
      this.usersToAdd.emit({ all: true });
    } else if (this.userSelection === 'specificPeople') {
      // Änderung: Emit der IDs ausgewählter Benutzer statt nur 'addedUser'
      this.usersToAdd.emit({ all: false, userIds: this.selectedUsers.map(user => user.id) });
    }
    this.toggle();
  }


//user werden gefilter anhand der einagbe im input und der bereits im channel befindlichen user
  filterUsers(): void {
    if (!this.userInput) {
      this.filteredUsers = [];
    } else {
      this.filteredUsers = this.allUsers.filter(user =>
        user.name.toLowerCase().includes(this.userInput.toLowerCase())
      );
    }
  }

addSelectedUser(user): void {
  if (!this.selectedUsers.some(selectedUser => selectedUser.id === user.id)) {
    this.selectedUsers.push(user);
    this.filteredUsers = [];
    this.userInput = '';
  }
}

removeUser(userToRemove): void {
  this.selectedUsers = this.selectedUsers.filter(user => user.id !== userToRemove.id);
}


  shouldDisableSubmit(): boolean {
    return this.userSelection === 'specificPeople' && this.selectedUsers.length === 0;
  }

  async initializeData() {
    this.activeChannelMembers = await this.fetchActiveChannelMembers();
    await this.fetchUsers();
  }

  //lädt id vom aktiven chanel um zu sehen welche user schon mitglieder sind
  async fetchActiveChannelMembers() {
    const channelsCol = collection(db, 'channels');
    const channelSnapshot = await getDocs(channelsCol);
    const activeChannel = channelSnapshot.docs.find(doc => doc.data()['isActive']);
    if (activeChannel && activeChannel.data()['members']) {
      return activeChannel.data()['members'];
    } else {
      return [];
    }
  }

  //lädt alle user bis auf die welche bereits im cahnnel sind
  async fetchUsers() {
    const usersCol = collection(db, 'users');
    const userSnapshot = await getDocs(usersCol);
    const userList = userSnapshot.docs.map(doc => doc.data()).filter(user => !this.activeChannelMembers.includes(user['id']));
    this.allUsers = userList;
  }
}
