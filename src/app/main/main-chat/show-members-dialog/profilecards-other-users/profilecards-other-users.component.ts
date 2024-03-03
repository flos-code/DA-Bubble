import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-profilecards-other-users',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './profilecards-other-users.component.html',
  styleUrl: './profilecards-other-users.component.scss'
})
export class ProfilecardsOtherUsersComponent implements OnInit {
  @Input() memberData!: any;
  @Input() showProfileCard: boolean;
  @Output() showProfileCardChild = new EventEmitter();

  ngOnInit(): void {
      console.log('Members data', this.memberData);
  }


  closeProfileCard() {
    this.showProfileCard = false;
    this.showProfileCardChild.emit(this.showProfileCard);
  }

  doNotClose($event: any) {
    $event.stopPropagation(); 
  }

  writeMessage() {
    // open new DM chat or switch to existing one (type: DM / path to collection)
  }
}
