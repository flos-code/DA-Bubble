import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
} from '@angular/fire/firestore';
import { ChatService } from '../../../services/chat.service';
@Component({
  selector: 'app-dialog-add-user-new-channel',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './dialog-add-user-new-channel.component.html',
  styleUrls: [
    './dialog-add-user-new-channel.component.scss',
    './dialog-add-user-new-channel.component-mediaquery.scss',
  ],
})
export class DialogAddUserNewChannelComponent {
  @Input() isVisibleUser: boolean = false;
  @Input() newChannelId: string; // ID des Nutzers/Kanals/Threads
  @Output() toggleVisibility = new EventEmitter<void>();
  @Output() toggleVisibilityChannel = new EventEmitter<void>();
  @Output() usersToAdd = new EventEmitter<{
    all: boolean;
    userIds?: string[];
  }>();
  @ViewChild('form') form!: NgForm;

  userSelection: string = 'allMembers';
  addedUser: string = 'test';
  allUsers = [];
  filteredUsers = [];
  selectedUsers = [];
  activeChannelMembers: string[] = [];
  inputFocused: boolean = false;
  userInputModel: string = '';

  private firestore: Firestore = inject(Firestore);

  constructor(private chatService: ChatService) {
    this.filterUsers();
  }

  ngOnInit() {
    this.initializeData();
  }

  toggle(): void {
    this.toggleVisibility.emit();
  }

  toggleChannel(): void {
    this.toggleVisibilityChannel.emit();
  }

  closeBoth() {
    this.toggle();
    this.toggleChannel();
  }
  stopPropagation(event: MouseEvent) {
    event.stopPropagation();
  }

  addUser(): void {
    if (this.userSelection === 'allMembers') {
      this.usersToAdd.emit({ all: true });
    } else if (this.userSelection === 'specificPeople') {
      // Änderung: Emit der IDs ausgewählter Benutzer statt nur 'addedUser'
      this.usersToAdd.emit({
        all: false,
        userIds: this.selectedUsers.map((user) => user.id),
      });
    }
    this.closeBoth();
  }

  //user werden gefilter anhand der einagbe im input und der bereits im channel befindlichen user
  filterUsers(): void {
    if (!this.userInputModel) {
      this.filteredUsers = [];
    } else {
      this.filteredUsers = this.allUsers
        .filter((user) =>
          user.name.toLowerCase().includes(this.userInputModel.toLowerCase())
        )
        .filter(
          (user) =>
            !this.selectedUsers.some(
              (selectedUser) => selectedUser.id === user.id
            )
        ); // Filtere Benutzer, die nicht bereits ausgewählt wurden
    }
  }

  addSelectedUser(user): void {
    if (
      !this.selectedUsers.some((selectedUser) => selectedUser.id === user.id)
    ) {
      this.selectedUsers.push(user);
      this.filteredUsers = [];
      this.userInputModel = '';
      // this.adjustTextboxHeight();
    }
  }

  removeUser(userToRemove): void {
    this.selectedUsers = this.selectedUsers.filter(
      (user) => user.id !== userToRemove.id
    );
    // this.adjustTextboxHeight();
  }

  shouldDisableSubmit(): boolean {
    return (
      this.userSelection === 'specificPeople' && this.selectedUsers.length === 0
    );
  }

  async initializeData() {
    this.activeChannelMembers = await this.fetchActiveChannelMembers();
    await this.fetchUsers();
  }

  // getActiveChannelId() {
  //   return this.chatService.getActiveChannelId();
  // }

  //lädt id vom aktiven chanel um zu sehen welche user schon mitglieder sind
  async fetchActiveChannelMembers(): Promise<string[]> {
    const activeChannelId = this.newChannelId;
    if (activeChannelId) {
      const channelRef = doc(this.firestore, 'channels', activeChannelId);
      const channelSnap = await getDoc(channelRef);
      if (channelSnap.exists()) {
        const members = channelSnap.data()['members'];
        if (members) {
          return members;
        }
      }
    }
    console.log('Keine Mitglieder gefunden oder Channel ID ist null.');
    return [];
  }

  //lädt alle user bis auf die welche bereits im cahnnel sind
  async fetchUsers() {
    const usersCol = collection(this.firestore, 'users');
    const userSnapshot = await getDocs(usersCol);
    // Filtere Benutzer basierend darauf, ob ihre ID bereits im `activeChannelMembers` Array vorhanden ist
    const userList = userSnapshot.docs
      .filter((doc) => !this.activeChannelMembers.includes(doc.id))
      .map((doc) => ({ id: doc.id, ...doc.data() }));

    this.allUsers = userList; // Aktualisiere `allUsers` mit der gefilterten Liste
  }

  onInputFocus(): void {
    this.inputFocused = true;
  }

  onInputBlur(): void {
    this.inputFocused = false;
  }
}
