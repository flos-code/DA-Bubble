import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot,  limit, query, doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
import { Router } from '@angular/router';
import { Channel } from '../../../../models/channel.class';
import { C } from '@angular/cdk/keycodes';

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
  selector: 'app-show-members-dialog',
  standalone: true,
  imports: [],
  templateUrl: './show-members-dialog.component.html',
  styleUrl: './show-members-dialog.component.scss'
})
export class ShowMembersDialogComponent implements OnInit {
  @Input() channelData;
  @Input() currentChannelId: string;
  membersData = [];

  @Output() showMembersDialogOpenChild = new EventEmitter();
  @Output() addMembersDialogOpenOpenChildShow = new EventEmitter();

  showMembersDialogOpen: boolean;
  addMemberDialogOpen: boolean;


  ngOnInit(): void {
      this.getMembers();
      console.log('Show members channel data', this.channelData);
      console.log('Current members ids', this.channelData[0].members);

  }

  getMembers() {
      const q = query(collection(db, 'users'));

      return onSnapshot(q, (list) => {
        this.membersData = [];
        list.forEach(element => {
          for (let i = 0; i < this.channelData[0].members.length; i++) {
            const memberId = this.channelData[0].members[i];
            if(element.id == memberId) {
              this.membersData.push(element.data());
              console.log('Members data array', this.membersData);
            }         
          }      
        });
      });    
  }

  openProfileCard() {
    
  }

  doNotClose($event: any) {
    $event.stopPropagation(); 
  }

  closeDialog() {
    this.showMembersDialogOpen = false;
    this.showMembersDialogOpenChild.emit(this.showMembersDialogOpen)
  }

  goToAddMemberDialog() {
    this.showMembersDialogOpen = false;
    this.showMembersDialogOpenChild.emit(this.showMembersDialogOpen)
    this.addMembersDialogOpenOpenChildShow.emit(this.addMemberDialogOpen)
  }
}
