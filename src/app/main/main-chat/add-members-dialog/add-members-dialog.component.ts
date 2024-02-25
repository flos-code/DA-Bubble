import { Component, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CommonModule } from '@angular/common';

/* ========== FIREBASE ========== */
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot,  query, doc, updateDoc } from "firebase/firestore";

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
  selector: 'app-add-members-dialog',
  standalone: true,
  imports: [ MatIconModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatChipsModule, MatAutocompleteModule, CommonModule ],
  templateUrl: './add-members-dialog.component.html',
  styleUrl: './add-members-dialog.component.scss'
})

export class AddMembersDialogComponent implements OnInit {
  @Input() channelData;
  channelMembers;
  @Input() currentChannelId: string;
  @Output() addMemberDialogOpenChild = new EventEmitter();
  addMemberDialogOpen: boolean;
  inputFocus: boolean = false;
  searchText: string = '';
  newUsersToAdd = [];
  userList = [];
  originalUserList;
  filteredUserList;

  ngOnInit(): void {
    this.channelMembers = [...this.channelData['members']];
    this.getUsersToAdd();
  }

  constructor() { }

  getUsersToAdd() {
    const q = query(collection(db, 'users'));
    return onSnapshot(q, (list) => {
      list.forEach(element => {
        if(!this.channelMembers.includes(element.id)) {
            this.userList.push({
              'userName': element.data()['name'],
              'userId': element.id
            });
        }
      });
      this.filteredUserList = this.userList;
      this.originalUserList = this.userList;

    });  
  }

  searchKey(data:string) {
    this.searchText = data;
    this.search();
  }

  search() {
    this.filteredUserList = this.userList;

    if(this.searchText !== "") {
        this.filteredUserList =  this.userList.filter( user =>  {
          return user.userName.toLowerCase().includes(this.searchText);
        });
      } else {
      this.filteredUserList = this.originalUserList;      
    }
  }

  doNotClose($event: any) {
    $event.stopPropagation(); 
  }

  closeDialog() {
    this.addMemberDialogOpen = false;
    this.addMemberDialogOpenChild.emit(this.addMemberDialogOpen);
    this.inputFocus = false;
  }

  showUserList() {
    this.inputFocus = true;
  }

  addUser(filteredUser: any) {
    let existingUser = this.userList.find(user => user.userId == filteredUser.userId);
    let indexOfAddedUser = this.userList.indexOf(existingUser);
    this.newUsersToAdd.push(filteredUser);        // Push user in newUsersToAdd array.
    this.userList.splice(indexOfAddedUser, 1);    // Splice userList array and remove user
    this.filteredUserList = this.userList;
    this.inputFocus = false; 
    console.log('New users to add array', this.newUsersToAdd);
  }

  removeAddedUser(userToAdd: any, i: number) {
      this.filteredUserList = this.userList;
      this.userList.push(userToAdd);            // Push to user List array
      this.newUsersToAdd.splice(i, 1);          // Splice newUsersToAdd array and remove user
      this.filteredUserList = this.userList;
      this.originalUserList = this.userList;
      this.inputFocus = false;
  }

  async addUsers() {
    for (let i = 0; i < this.newUsersToAdd.length; i++) {
      const user = this.newUsersToAdd[i]['userId'];
      if(!this.channelMembers.includes(user)) {
        this.channelMembers.push(user);
      }
    }
    let currentChannelRef = doc(db, 'channels', this.currentChannelId);
    let data = {members: this.channelMembers };
    await updateDoc(currentChannelRef, data).then(() => {
      console.log('Members to Firebase added', this.channelMembers);
    });
    this.newUsersToAdd = [];
    this.closeDialog();
  }

  closeUserList() {
    this.inputFocus = false;
  }

}

