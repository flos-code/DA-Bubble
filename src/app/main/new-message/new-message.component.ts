import { Component } from '@angular/core';
import { TextBoxComponent } from './text-box/text-box.component';
import { Observable } from 'rxjs';
import { User } from '../../../models/user.class';
import { UserManagementService } from '../../services/user-management.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-new-message',
  standalone: true,
  imports: [TextBoxComponent, CommonModule],
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss',
})
export class NewMessageComponent {
  filteredUsers: { id: string; data: User }[] = [];
  displayUserList: boolean = false;

  constructor(private userManagementService: UserManagementService) {}

  ngOnInit(): void {
    this.userManagementService.loadUsers(); // Laden der Benutzer beim Initialisieren
  }

  onInputChange(inputValue: string): void {
    this.displayUserList = inputValue.startsWith('@'); // Anzeigen der Liste, wenn '@' eingegeben wird
    if (this.displayUserList) {
      this.userManagementService.users$.subscribe((users) => {
        this.filteredUsers = users; // Alle Benutzer zuweisen, da '@' eingegeben wurde
      });
    } else {
      this.filteredUsers = []; // Leeren der Liste, wenn Bedingung nicht erfüllt ist
    }
  }
}
