import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss',
})
export class SideBarComponent {
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
  ];

  ngOnInit(): void {
    this.sortUsers();
  }

  sortUsers(): void {
    this.users.sort((a, b) => {
      return a.isYou === true ? -1 : b.isYou === true ? 1 : 0;
    });
  }
}
