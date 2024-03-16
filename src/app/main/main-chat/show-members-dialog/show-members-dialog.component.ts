import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ProfilecardsOtherUsersComponent } from './profilecards-other-users/profilecards-other-users.component';

@Component({
  selector: 'app-show-members-dialog',
  standalone: true,
  imports: [CommonModule, ProfilecardsOtherUsersComponent],
  templateUrl: './show-members-dialog.component.html',
  styleUrl: './show-members-dialog.component.scss'
})

export class ShowMembersDialogComponent implements OnInit {
  @Input() currentUser!: string;
  @Input() channelData!: any;
  @Input() currentChannelId!: string;
  @Input() channelMembers!: any;
  @Output() showMembersDialogOpenChild = new EventEmitter();
  @Output() addMembersDialogOpenOpenChildShow = new EventEmitter();
  showMembersDialogOpen: boolean;
  addMemberDialogOpen: boolean;
  showProfileCard: boolean = false;
  memberData: any

  ngOnInit(): void { }

  openProfileCard(member: any) {
    this.memberData = member; 
    this.showProfileCard = true;
  }

  doNotClose($event: any) {
    $event.stopPropagation(); 
  }

  closeDialog() {
    this.showMembersDialogOpen = false;
    this.showMembersDialogOpenChild.emit(this.showMembersDialogOpen);
  }

  closeProfileCard(closeProfileCard: boolean) {
    this.showProfileCard = false;
  }

  closeAll(closeProfileCard: boolean) {
    this.showProfileCard = false;
    this.showMembersDialogOpen = false;
    this.showMembersDialogOpenChild.emit(this.showMembersDialogOpen);
  }

  goToAddMemberDialog() {
    this.showMembersDialogOpen = false;
    this.showMembersDialogOpenChild.emit(this.showMembersDialogOpen)
    this.addMembersDialogOpenOpenChildShow.emit(this.addMemberDialogOpen)
  }
}
