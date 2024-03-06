import { Component, inject } from '@angular/core';
import { TextBoxComponent } from './text-box/text-box.component';
import { Observable } from 'rxjs';
import { User } from '../../../models/user.class';
import { UserManagementService } from '../../services/user-management.service';
import { CommonModule } from '@angular/common';
import { Channel } from '../../../models/channel.class';
import { Firestore, collection, onSnapshot } from '@angular/fire/firestore';

@Component({
  selector: 'app-new-message',
  standalone: true,
  imports: [TextBoxComponent, CommonModule],
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss',
})
export class NewMessageComponent {
  filteredUsers: { id: string; data: User }[] = [];
  displayUser: boolean = false;
  displayChannels: boolean = false;
  channels$: Observable<{ id: string; data: Channel }[]>;

  private firestore: Firestore = inject(Firestore);

  constructor(private userManagementService: UserManagementService) {}

  async ngOnInit() {
    this.userManagementService.activeUserId$.subscribe((activeUserId) => {
      if (activeUserId) {
        this.channels$ = this.loadChannels(activeUserId);
      }
    });
    this.userManagementService.loadUsers();
  }

  onInputChange(inputValue: string): void {
    this.displayUser = inputValue.startsWith('@');
    this.displayChannels = inputValue.startsWith('#'); // Anzeigen der Liste, wenn '@' eingegeben wird
    if (this.displayUser) {
      this.userManagementService.users$.subscribe((users) => {
        this.filteredUsers = users; // Alle Benutzer zuweisen, da '@' eingegeben wurde
      });
    } else if (this.displayChannels) {
      this.loadChannels;
    } else {
      this.filteredUsers = []; // Leeren der Liste, wenn Bedingung nicht erfüllt ist
    }
  }

  loadChannels(
    activeUserId: string
  ): Observable<{ id: string; data: Channel }[]> {
    const channelsCol = collection(this.firestore, 'channels');
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
}
