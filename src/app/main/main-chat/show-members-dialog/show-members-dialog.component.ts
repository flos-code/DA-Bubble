import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

/* ========== FIREBASE ========== */
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot,  query } from "firebase/firestore";
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
  imports: [CommonModule],
  templateUrl: './show-members-dialog.component.html',
  styleUrl: './show-members-dialog.component.scss'
})
export class ShowMembersDialogComponent implements OnInit {
  @Input() channelData;
  @Input() currentChannelId: string;
  @Input() members;
  @Output() showMembersDialogOpenChild = new EventEmitter();
  @Output() addMembersDialogOpenOpenChildShow = new EventEmitter();
  showMembersDialogOpen: boolean;
  addMemberDialogOpen: boolean;

  ngOnInit(): void { }

/*   getMembers() {
      const q = query(collection(db, 'users'));
      return onSnapshot(q, (list) => {
        this.membersData = [];
        list.forEach(element => {
          for (let i = 0; i < this.channelData['members'].length; i++) {
            const memberId = this.channelData['members'][i];
            if(element.id == memberId) {
              this.membersData.push(element.data());
            }         
          }      
        });
      });    
  } */

  openProfileCard() {
    
  }

  doNotClose($event: any) {
    $event.stopPropagation(); 
  }

  closeDialog() {
    this.showMembersDialogOpen = false;
    this.showMembersDialogOpenChild.emit(this.showMembersDialogOpen);
  }

  goToAddMemberDialog() {
    this.showMembersDialogOpen = false;
    this.showMembersDialogOpenChild.emit(this.showMembersDialogOpen)
    this.addMembersDialogOpenOpenChildShow.emit(this.addMemberDialogOpen)
  }
}
