import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

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
  selector: 'app-show-members-dialog',
  standalone: true,
  imports: [],
  templateUrl: './show-members-dialog.component.html',
  styleUrl: './show-members-dialog.component.scss'
})
export class ShowMembersDialogComponent implements OnInit {
  @Input() channelData = [];
  @Input() currentChannelId: string;
  channelCreatedByName: string = "";
  membersData = [];

  @Output() showMembersDialogOpenChild = new EventEmitter();
  @Output() addMembersDialogOpenOpenChildShow = new EventEmitter();

  showMembersDialogOpen: boolean;
  addMemberDialogOpen: boolean;

  ngOnInit(): void {
      //this.getMembers();


  }

/*   getMembers() {
    for (let i = 0; i < this.channelData[0].members.length; i++) {
      const memberId = this.channelData[0].members[i];
      console.log(memberId);
      const q = query(collection(db, 'users'));

      return onSnapshot(q, (list) => {
        list.forEach(element => {
          if(element.id == memberId) {
            this.membersData.push(element.data());
          }
        });
      });    
    }
  } */


  doNotClose($event: any) {
    $event.stopPropagation(); 

  }

  closeDialog() {
    this.showMembersDialogOpen = false;
    this.showMembersDialogOpenChild.emit(this.showMembersDialogOpen)
  }

  addMemberToChannel() {
    this.showMembersDialogOpen = false;
    this.showMembersDialogOpenChild.emit(this.showMembersDialogOpen)
    this.addMembersDialogOpenOpenChildShow.emit(this.addMemberDialogOpen)
  }
}
