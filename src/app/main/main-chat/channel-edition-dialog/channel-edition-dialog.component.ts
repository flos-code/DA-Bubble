import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot,  limit, query, doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
import { Router } from '@angular/router';
import { Channel } from '../../../../models/channel.class';

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
  @Input() channelData = [];
  @Input() currentChannelId;
  

  @Output() channelEditionDialogOpenChild = new EventEmitter();
  channelEditionDialogOpen: boolean;
  showchannelEditionName: boolean = true;
  showchannelEditionDescription: boolean = true;

  editedChannelName: string;
  editedChannelDescription: string;

  ngOnInit(): void {
      console.log('Current channel data', this.channelData)
  }

  closeDialog() {
    this.channelEditionDialogOpen = false;
    this.channelEditionDialogOpenChild.emit(this.channelEditionDialogOpen)
  }

  editChannelName() {
    // Current channel name = placeholder
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

/*   getCleanJSON(user: User) {
    return {
        'id': user.id,
        'firstName': user.firstName,
        'lastName': user.lastName,
        'email': user.email,
        'birthDate': user.birthDate,
        'address': user.address,
        'zipCode': user.zipCode,
        'city': user.city
    }
  } */

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

  doNotClose($event: any) {
    $event.stopPropagation(); 
  }

}
