import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DialogAddChannelComponent } from './dialog-add-channel/dialog-add-channel.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddUserNewChannelComponent } from './dialog-add-user-new-channel/dialog-add-user-new-channel.component';
import { ViewManagementService } from '../../services/view-management.service';

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

  selectedChannelId: number | null = null;
  selectedUserId: number | null = null;

  constructor(
    public dialog: MatDialog,
    private viewManagementService: ViewManagementService
  ) {}

  channels = [
    {
      name: 'Allgemein',
      id: 0,
    },
    {
      name: 'Entwicklerteam',
      id: 1,
    },
    {
      name: 'Office-team',
      id: 2,
    },
  ];

  users = [
    {
      firstName: 'Frederik',
      lastName: 'Gluber',
      email: 'g.gluber@mail.com',
      onlineStatus: 'idle',
      image: './assets/img/userImages/userImage2.svg',
      isYou: false,
      userID: 0,
    },
    {
      firstName: 'Sofia',
      lastName: 'Müller',
      email: 's.müller@mail.com',
      onlineStatus: 'active',
      image: './assets/img/userImages/userImage1.svg',
      isYou: true,
      userID: 1,
    },
    {
      firstName: 'Noah',
      lastName: 'Braun',
      email: 'n.braun@mail.com',
      onlineStatus: 'away',
      image: './assets/img/userImages/userImage3.svg',
      isYou: false,
      userID: 2,
    },
    {
      firstName: 'Elias',
      lastName: 'Neumann',
      email: 'e.neumann@mail.com',
      onlineStatus: 'busy',
      image: './assets/img/userImages/userImage4.svg',
      isYou: false,
      userID: 3,
    },
    {
      firstName: 'Elias',
      lastName: 'Neumann',
      email: 'e.neumann@mail.com',
      onlineStatus: 'busy',
      image: './assets/img/userImages/userImage4.svg',
      isYou: false,
      userID: 3,
    },
    {
      firstName: 'Elias',
      lastName: 'Neumann',
      email: 'e.neumann@mail.com',
      onlineStatus: 'busy',
      image: './assets/img/userImages/userImage4.svg',
      isYou: false,
      userID: 3,
    },
    {
      firstName: 'Elias',
      lastName: 'Neumann',
      email: 'e.neumann@mail.com',
      onlineStatus: 'busy',
      image: './assets/img/userImages/userImage4.svg',
      isYou: false,
      userID: 3,
    },
    {
      firstName: 'Elias',
      lastName: 'Neumann',
      email: 'e.neumann@mail.com',
      onlineStatus: 'busy',
      image: './assets/img/userImages/userImage4.svg',
      isYou: false,
      userID: 3,
    },
    {
      firstName: 'Elias',
      lastName: 'Neumann',
      email: 'e.neumann@mail.com',
      onlineStatus: 'busy',
      image: './assets/img/userImages/userImage4.svg',
      isYou: false,
      userID: 3,
    },
    {
      firstName: 'Elias',
      lastName: 'Neumann',
      email: 'e.neumann@mail.com',
      onlineStatus: 'busy',
      image: './assets/img/userImages/userImage4.svg',
      isYou: false,
      userID: 3,
    },
  ];

  ngOnInit(): void {
    this.sortUsers();
  }

  sortUsers(): void {
    this.users.sort((a, b) => {
      return a.isYou === true ? -1 : b.isYou === true ? 1 : 0;
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
    this.selectedChannelId = null;
    this.selectedUserId = null;
    this.showChat('showNewMessage');
  }

  selectChannel(channelId: number): void {
    this.selectedChannelId = channelId;
    this.selectedUserId = null;
    this.showChat('showMainChat');
  }

  selectUser(userId: number): void {
    this.selectedUserId = userId;
    this.selectedChannelId = null;
    this.showChat('showDms');
  }

  showChat(view: 'showMainChat' | 'showDms' | 'showNewMessage'): void {
    this.viewManagementService.changeView(view);
  }
}
