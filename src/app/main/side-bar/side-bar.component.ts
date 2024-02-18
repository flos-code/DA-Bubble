import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DialogAddChannelComponent } from './dialog-add-channel/dialog-add-channel.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddUserNewChannelComponent } from './dialog-add-user-new-channel/dialog-add-user-new-channel.component';

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
  @Output() viewChange = new EventEmitter<
    'showMainChat' | 'showDms' | 'showNewMessage'
  >();

  workspaceVisible: boolean = true;
  channelsVisible: boolean = true;
  usersVisible: boolean = true;
  dialogAddChannelVisible: boolean = false;
  dialogAddUserVisible: boolean = false;

  constructor(public dialog: MatDialog) {}

  channels: string[] = ['Allgemein', 'Entwicklerteam', 'Office-team'];
  users = [
    {
      firstName: 'Frederik',
      lastName: 'Beck',
      email: 'f.beck@mail.com',
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

  showChat(view: 'showMainChat' | 'showDms' | 'showNewMessage'): void {
    this.viewChange.emit(view);
  }
}
