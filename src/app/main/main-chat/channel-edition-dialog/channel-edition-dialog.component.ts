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
  @Input() currentUser: string;
  channelCreatedByName: string = "";
  channelEditionDialogOpen: boolean;
  @Output() channelEditionDialogOpenChild = new EventEmitter();
  showchannelEditionName: boolean = true;
  showchannelEditionDescription: boolean = true;
  editedChannelName: string;
  editedChannelDescription: string;
  showPopup: boolean = false;
  showPopupLeaveChannel: boolean = false;

  ngOnInit(): void {
    this.setChannelCreatedBy();
    console.log(this.channelData.members);
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
    if(this.currentUser == this.channelData.createdBy) {
      this.showchannelEditionName = false;
    } else {
      this.showPopup = true;
      setTimeout(() => {
        this.showPopup = false;
      }, 5000);
    }
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
    if(this.currentUser == this.channelData.createdBy) {
      this.showchannelEditionDescription = false;
    } else {
      this.showPopup = true;
      setTimeout(() => {
        this.showPopup = false;
      }, 5000);
    }
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

  openAskLeaveChannel() {
    this.showPopupLeaveChannel = true;
  }

  async leaveChannel() {
    let index = this.channelData.members.indexOf(this.currentUser);
    this.channelData.members.splice(index, 1);
    let currentRef = doc(db, `channels/${this.currentChannelId}`);
    let data = {
      members: this.channelData.members
    };
    await updateDoc(currentRef, data).then(() => {
    }); 

    this.showPopupLeaveChannel = false;   
    this.channelEditionDialogOpen = false;
    this.channelEditionDialogOpenChild.emit(this.channelEditionDialogOpen);
  }

  closePopupLeaveChannel() {
    this.showPopupLeaveChannel = false;
  }

  doNotClose($event: any) {
    $event.stopPropagation(); 
  }

}
