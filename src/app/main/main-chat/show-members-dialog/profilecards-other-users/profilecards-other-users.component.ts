import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/* ========== FIREBASE ========== */
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot,  query, addDoc } from "firebase/firestore";
import { ChatService } from '../../../../services/chat.service';
import { DirectMessage } from '../../../../../models/directMessage.class';

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

  constructor(private chatService: ChatService, private directMessage: DirectMessage) { }

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
    try {
      const dmData = new DirectMessage().toJSON();
      // Füge den neuen Kanal hinzu
      const docRef = await addDoc(collection(db, `users/${this.currentUser}/allDirectMessages`, this.memberData.id), {
        ...dmData,
      });
      console.log('Dokument erfolgreich hinzugefügt mit ID: ', docRef.id);

      // Setze die neue erstellte direct message als aktiv
      this.chatService.setSelectedUserId(this.memberData.id);
    } catch (error) {
      console.error('Fehler beim Hinzufügen der DM: ', error);
    }
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
