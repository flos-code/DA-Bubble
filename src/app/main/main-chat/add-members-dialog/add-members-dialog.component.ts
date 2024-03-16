import { Component, EventEmitter, Output, OnInit, Input, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CommonModule } from '@angular/common';
import {Firestore, collection, onSnapshot,  query, doc, updateDoc} from '@angular/fire/firestore';


@Component({
  selector: 'app-add-members-dialog',
  standalone: true,
  imports: [ MatIconModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatChipsModule, MatAutocompleteModule, CommonModule ],
  templateUrl: './add-members-dialog.component.html',
  styleUrl: './add-members-dialog.component.scss'
})

export class AddMembersDialogComponent implements OnInit {
  private firestore: Firestore = inject(Firestore);
  @Input() channelData!: any;
  @Input() channelMembers!: any; 
  @Input() currentChannelId: string;
  @Output() addMemberDialogOpenChild = new EventEmitter();
  addMemberDialogOpen: boolean;
  inputFocus: boolean = false;
  searchText: string = '';
  newUsersToAdd = [];
  userList = [];
  originalUserList: any;
  filteredUserList: any;

  ngOnInit(): void {
    this.getUsersToAdd();
  }

  constructor() { }

  getUsersToAdd() {
    const q = query(collection(this.firestore, 'users'));
    return onSnapshot(q, (list) => {
      list.forEach(element => {
        if(!this.channelData.members.includes(element.id)) {
            this.userList.push({
              'userName': element.data()['name'],
              'userId': element.id,
              'isOnline': element.data()['isOnline'],
              'imgUrl': element.data()['imgUrl']
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
          return user.userName.toLowerCase().includes(this.searchText.toLowerCase());
        });
      } else {
      this.filteredUserList = this.originalUserList;      
    }
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
      if(!this.channelData.members.includes(user)) {
        this.channelData.members.push(user);
      }
    }
    let currentChannelRef = doc(this.firestore, 'channels', this.currentChannelId);
    let data = {members: this.channelData.members };
    await updateDoc(currentChannelRef, data).then(() => {
    });
    this.newUsersToAdd = [];
    this.closeDialog();
  }

  closeUserList() {
    this.inputFocus = false;
  }

  doNotClose($event: any) {
    $event.stopPropagation(); 
  }
}

