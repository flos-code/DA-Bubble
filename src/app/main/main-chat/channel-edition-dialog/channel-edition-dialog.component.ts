import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/* ========== FIREBASE ========== */
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, query, doc, updateDoc, where, arrayRemove } from "firebase/firestore";

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
  selector: 'app-channel-edition-dialog',
  standalone: true,
  imports: [ CommonModule, FormsModule ],
  templateUrl: './channel-edition-dialog.component.html',
  styleUrl: './channel-edition-dialog.component.scss'
})
export class ChannelEditionDialogComponent implements OnInit {
  @Input() channelData!: any;
  @Input() currentChannelId!: any;
  @Input() channelMembers!: any;
  channelCreatedByName: string = "";

  @Output() channelEditionDialogOpenChild = new EventEmitter();
  channelEditionDialogOpen: boolean;
  showchannelEditionName: boolean = true;
  showchannelEditionDescription: boolean = true;

  editedChannelName: string;
  editedChannelDescription: string;

  ngOnInit(): void {
    this.setChannelCreatedBy();
  }

  setChannelCreatedBy() {
    for (let i = 0; i < this.channelMembers.length; i++) {
      const member = this.channelMembers[i];
        if(member['id'] == this.channelData['createdBy']) {
          this.channelCreatedByName = member['name'];
        }
    }
  };

  closeDialog() {
    this.channelEditionDialogOpen = false;
    this.channelEditionDialogOpenChild.emit(this.channelEditionDialogOpen)
  }

  editChannelName() {
    this.showchannelEditionName = false;
  }

  async saveChannelName() {
    if(this.editedChannelName) {
      let currentChannelRef = doc(db, 'channels', this.currentChannelId);
      let data = {name: this.editedChannelName };
      await updateDoc(currentChannelRef, data).then(() => {
      });
      this.editedChannelName = "";
      this.showchannelEditionName = true;
    } else {
      this.showchannelEditionName = true;
    }
  }

  editChannelDescription() {
    this.showchannelEditionDescription = false;
  }

  async saveChannelDescription() {
    if(this.editedChannelDescription) {
      let currentChannelRef = doc(db, 'channels', this.currentChannelId);
      let data = {description: this.editedChannelDescription };
      await updateDoc(currentChannelRef, data).then(() => {
      });
      this.editedChannelDescription = "";
      this.showchannelEditionDescription = true;  
    } else {
      this.showchannelEditionDescription = true;  
    }
  }

  async leaveChannel() {
    await updateDoc(doc(db, 'channels', this.currentChannelId), {
      members: arrayRemove(this.channelData.createdBy)
    });
  }

  doNotClose($event: any) {
    $event.stopPropagation(); 
  }

}
