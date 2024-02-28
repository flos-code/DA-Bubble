import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-profilecards-other-users',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './profilecards-other-users.component.html',
  styleUrl: './profilecards-other-users.component.scss'
})
export class ProfilecardsOtherUsersComponent {
  @Input() memberData;
  @Input() showProfileCard: boolean;
  @Output() showProfileCardChild = new EventEmitter();


  closeProfileCard() {
    this.showProfileCard = false;
    this.showProfileCardChild.emit(this.showProfileCard);
  }

  doNotClose($event: any) {
    $event.stopPropagation(); 
  }
}
