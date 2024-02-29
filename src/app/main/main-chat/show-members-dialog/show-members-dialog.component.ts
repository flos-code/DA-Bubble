import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

/* ========== FIREBASE ========== */
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot,  query } from "firebase/firestore";
import { ProfilecardsOtherUsersComponent } from './profilecards-other-users/profilecards-other-users.component';
import { ProfilCardService } from '../../../services/profil-card.service';
const firebaseConfig = {
  apiKey: "AIzaSyC520Za3P8qTUGvWM0KxuYqGIMaz-Vd48k",
  authDomain: "da-bubble-87fea.firebaseapp.com",
  projectId: "da-bubble-87fea",
  storageBucket: "da-bubble-87fea.appspot.com",
  messagingSenderId: "970901942782",
  appId: "1:970901942782:web:56b67253649b6206f290af"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
/* =============================== */

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
  @Input() currentChannelId: string;
  @Input() channelMembers!: any;
  @Output() showMembersDialogOpenChild = new EventEmitter();
  @Output() addMembersDialogOpenOpenChildShow = new EventEmitter();
  showMembersDialogOpen: boolean;
  addMemberDialogOpen: boolean;
  showProfileCard: boolean = false;
  memberData: any

  ngOnInit(): void {
    console.log('channelMembers', this.channelMembers);
   }

  constructor(public serviceProfilCard: ProfilCardService) {

  }

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

  goToAddMemberDialog() {
    this.showMembersDialogOpen = false;
    this.showMembersDialogOpenChild.emit(this.showMembersDialogOpen)
    this.addMembersDialogOpenOpenChildShow.emit(this.addMemberDialogOpen)
  }
}
