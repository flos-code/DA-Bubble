import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/* ========== FIREBASE ========== */
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot,  query, addDoc, updateDoc, doc, setDoc } from "firebase/firestore";
import { ChatService } from '../../../../services/chat.service';

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
  selector: 'app-profilecards-other-users',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './profilecards-other-users.component.html',
  styleUrl: './profilecards-other-users.component.scss'
})
export class ProfilecardsOtherUsersComponent {
  @Input() currentUser!: string;
  @Input() memberData!: any;
  @Input() showProfileCard!: boolean;
  @Output() showProfileCardChild = new EventEmitter();
  @Input() showMembersDialogOpen!: boolean;
  @Output() showMembersDialogOpenChild = new EventEmitter();

  constructor(private chatService: ChatService) { }

  writeDirectMessage() {
    const q = query(collection(db, `users/${this.currentUser}/allDirectMessages`));
    return onSnapshot(q, (list) => {
      list.forEach(element => {
        if(element.id === this.memberData.id) {
          this.chatService.setSelectedUserId(this.memberData.id);
          this.closeProfileCard();
          this.closeShowMembers();
        } else {
          // Create new DM Chat
          this.addDirectMessage();
          this.closeProfileCard();
          this.closeShowMembers();
        }  
      });
    });
  }

  async addDirectMessage (): Promise<void> {
    const dmSenderRef = doc(collection(db, `users/${this.currentUser}/allDirectMessages`), this.memberData.id);
    const dmReceiverRef = doc(collection(db, `users/${this.memberData.id}/allDirectMessages`), this.currentUser);
    let data = { }
    await setDoc(dmSenderRef, data);
    await setDoc(dmReceiverRef, data);
    this.chatService.setSelectedUserId(this.memberData.id);
  }

  getActiveChannelId() {
    return this.chatService.getActiveChannelId();
  }

  closeProfileCard() {
    this.showProfileCard = false;
    this.showProfileCardChild.emit(this.showProfileCard);
  }

  closeShowMembers() {
    this.showMembersDialogOpen = false;
    this.showMembersDialogOpenChild.emit(this.showProfileCard);
  }

  doNotClose($event: any) {
    $event.stopPropagation(); 
  }
}
