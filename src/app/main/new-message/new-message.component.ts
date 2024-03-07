import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { TextBoxComponent } from './text-box/text-box.component';
import { Subscription } from 'rxjs';
import { UserManagementService } from '../../services/user-management.service';
import { CommonModule } from '@angular/common';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';

@Component({
  selector: 'app-new-message',
  standalone: true,
  imports: [TextBoxComponent, CommonModule],
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss',
})
export class NewMessageComponent {
  filteredUsers: any = [];
  allUsers: any = [];
  selectedUser = null;
  filteredChannel: any = [];
  allChannel: any = [];
  selectedChannel = null;
  displayUser: boolean = false;
  displayChannels: boolean = false;

  @ViewChild('userInput') userInput: ElementRef<HTMLInputElement>;
  private firestore: Firestore = inject(Firestore);
  private userSubscription!: Subscription;
  private channelSubscription!: Subscription;

  constructor(public userManagementService: UserManagementService) {}

  ngOnInit(): void {
    const usersCollection = collection(this.firestore, 'users');
    this.userSubscription = collectionData(usersCollection, {
      idField: 'id',
    }).subscribe(
      (changes) => {
        console.log('Received Changes from DB', changes);
        this.allUsers = changes;
        this.sortUsers(this.allUsers);
        this.filteredUsers = this.allUsers;
      },
      (error) => {
        console.error('Error fetching changes:', error);
      }
    );

    const channelCollection = collection(this.firestore, 'channels');
    this.channelSubscription = collectionData(channelCollection, {
      idField: 'id',
    }).subscribe(
      (changes) => {
        console.log('Received Changes from DB', changes);
        this.allChannel = changes;
        this.sortChannel(this.allChannel);
        this.filteredChannel = this.allChannel;
      },
      (error) => {
        console.error('Error fetching changes:', error);
      }
    );

    this.userManagementService.loadUsers();
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
    this.channelSubscription.unsubscribe();
  }

  sortUsers(users): void {
    users.sort((a, b) => {
      if (a.id === this.userManagementService.activeUserId.value) return -1;
      if (b.id === this.userManagementService.activeUserId.value) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  sortChannel(channels): void {
    const filteredChannels = channels.filter((channel) =>
      channel.members.includes(this.userManagementService.activeUserId.value)
    );
    filteredChannels.sort((a, b) => a.creationDate - b.creationDate);
    this.allChannel = filteredChannels;
  }

  onInputChange(inputValue: string): void {
    this.displayUser = inputValue.startsWith('@');
    this.displayChannels = inputValue.startsWith('#');
    this.selectedChannel = null;
    this.selectedUser = null;
    if (this.displayUser) {
      const searchTerm = inputValue.slice(1).toLowerCase();
      this.filteredUsers = this.allUsers.filter((user) =>
        user.name.toLowerCase().startsWith(searchTerm)
      );
    } else if (this.displayChannels) {
      const searchTerm = inputValue.slice(1).toLowerCase();
      this.filteredChannel = this.allChannel.filter((channel) =>
        channel.name.toLowerCase().startsWith(searchTerm)
      );
    } else {
      this.filteredUsers = [];
      this.filteredChannel = [];
    }
    console.log(
      'ausgewähleter nutzer:',
      this.selectedUser,
      'ausgewähleter channel:',
      this.selectedChannel
    );
  }

  sendChannelMessage(channelId, channelName) {
    this.selectedChannel = channelId;
    console.log(this.selectedChannel);
    this.userInput.nativeElement.value = '#' + channelName;
    this.displayChannels = false;
  }

  sendUserMessage(userId, userName) {
    this.selectedUser = userId;
    console.log(this.selectedUser);
    this.userInput.nativeElement.value = '@' + userName;
    this.displayUser = false;
  }
}
