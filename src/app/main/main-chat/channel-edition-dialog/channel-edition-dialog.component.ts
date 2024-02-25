import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, query, doc, getDoc, updateDoc } from "firebase/firestore";

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

@Component({
  selector: 'app-channel-edition-dialog',
  standalone: true,
  imports: [ CommonModule, FormsModule ],
  templateUrl: './channel-edition-dialog.component.html',
  styleUrl: './channel-edition-dialog.component.scss'
})
export class ChannelEditionDialogComponent implements OnInit {
  @Input() channelData;
  @Input() currentChannelId: string;
  channelCreatedByName: string = "";

  @Output() channelEditionDialogOpenChild = new EventEmitter();
  channelEditionDialogOpen: boolean;
  showchannelEditionName: boolean = true;
  showchannelEditionDescription: boolean = true;

  editedChannelName: string;
  editedChannelDescription: string;

  ngOnInit(): void {
    console.log('Current channel data', this.channelData);
    this.setChannelCreatedBy();
  }

  setChannelCreatedBy() {
    const q = query(collection(db, 'users'));
    return onSnapshot(q, (list) => {
      list.forEach(element => {
        if(element.id == this.channelData[0].createdBy) {
          this.channelCreatedByName = element.data()['name'];
          console.log('Channel created by', this.channelCreatedByName);
        }
      });
    });
  }

  closeDialog() {
    this.channelEditionDialogOpen = false;
    this.channelEditionDialogOpenChild.emit(this.channelEditionDialogOpen)
  }

  editChannelName() {
    this.showchannelEditionName = false;
  }

  async saveChannelName() {
    //this.loading = true;
    let currentChannelRef = doc(db, 'channels', this.currentChannelId);
    let data = {name: this.editedChannelName };
    await updateDoc(currentChannelRef, data).then(() => {
    //updateDoc(currentChannelRef, this.channelData.toJSON()).then(() => {
    //this.loading = false;
    });
    this.editedChannelName = "";
    this.showchannelEditionName = true;
  }

  editChannelDescription() {
    this.showchannelEditionDescription = false;
  }

  async saveChannelDescription() {
    //this.loading = true;
    let currentChannelRef = doc(db, 'channels', this.currentChannelId);
    let data = {description: this.editedChannelDescription };
    await updateDoc(currentChannelRef, data).then(() => {
    //this.loading = false;
    });
    this.editedChannelDescription = "";
    this.showchannelEditionDescription = true;
  }

  leaveChannel() {
    // Delete id from members
    // Remove Channel from Sidebar??
  }

  doNotClose($event: any) {
    $event.stopPropagation(); 
  }

}
