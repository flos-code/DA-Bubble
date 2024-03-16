import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ChatService } from '../../../../services/chat.service';
import { Firestore, collection, onSnapshot, query, doc, setDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-profilecards-other-users',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './profilecards-other-users.component.html',
  styleUrl: './profilecards-other-users.component.scss'
})
export class ProfilecardsOtherUsersComponent implements OnInit {
  private firestore: Firestore = inject(Firestore);
  @Input() currentUser!: string;
  @Input() memberData!: any;
  //@Input() channelMembers!: any;
  @Input() showProfileCard!: boolean;
  @Output() showProfileCardChild = new EventEmitter();
  @Input() showMembersDialogOpen!: boolean;
  @Output() showMembersDialogOpenChild = new EventEmitter();

  constructor(private chatService: ChatService) { }

  ngOnInit(): void { }

  writeDirectMessage() {
    const q = query(collection(this.firestore, `users/${this.currentUser}/allDirectMessages`));
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
    const dmSenderRef = doc(collection(this.firestore, `users/${this.currentUser}/allDirectMessages`), this.memberData.id);
    const dmReceiverRef = doc(collection(this.firestore, `users/${this.memberData.id}/allDirectMessages`), this.currentUser);
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
