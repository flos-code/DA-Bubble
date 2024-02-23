import { Component, ElementRef, EventEmitter, Output, ViewChild, inject, NgModule, Pipe, PipeTransform, OnInit, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipEditedEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent, MatAutocompleteModule } from '@angular/material/autocomplete';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Observable, map, startWith } from 'rxjs';
import { AsyncPipe, CommonModule } from '@angular/common';
import { LiveAnnouncer } from '@angular/cdk/a11y';

import { FilterPipe } from './filter.pipe';

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
  selector: 'app-add-members-dialog',
  standalone: true,
  imports: [ MatIconModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatChipsModule, MatAutocompleteModule, CommonModule, FilterPipe ],
  templateUrl: './add-members-dialog.component.html',
  styleUrl: './add-members-dialog.component.scss'
})
export class AddMembersDialogComponent implements OnInit {
  @Input() channelData = [];
  @Input() currentChannelId: string;
  channelCreatedByName: string = "";

  
  ngOnInit(): void {
    console.log(this.filteredUserList);

  }

  @Output() addMemberDialogOpenChild = new EventEmitter();
  addMemberDialogOpen: boolean;
  inputFocus: boolean = false;

  searchText: string = '';
  newUsersToAdd = [];

  userList = [{
    'id': 'kalof85s8s',
    'name': 'Stefanie',
    'surname': 'Müller'
  },
  {
    'id': 'sldajfdffl22',
    'name': 'Tobias',
    'surname': 'Odermatt'
  },
  {
    'id': 'sldajzjzzfl22',
    'name': 'Filip',
    'surname': 'Neumann'
  },
  {
    'id': 'hufslehuf85ss',
    'name': 'Elias',
    'surname': 'Neumann'
  }];

  originalUserList = this.userList;
  filteredUserList = this.userList;

  searchKey(data:string) {
    this.searchText = data;
    this.search();
  }


  search() {
    this.filteredUserList = this.userList;

    if(this.searchText !== "") {
        this.filteredUserList =  this.userList.filter( user =>  {
          return user.name.toLowerCase().includes(this.searchText) || user.surname.toLowerCase().includes(this.searchText);
        });
      } else {
      this.filteredUserList = this.originalUserList;      
    }
  }

  constructor() { 
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

  addUser(filtereduser: any, i: number) {
    let userId = filtereduser.id;
    let existingUser = this.userList.find(user => user.id == userId);
    let indexOfAddedUser = this.userList.indexOf(existingUser);
    this.newUsersToAdd.push(filtereduser); // Push user in newUsersToAdd array.
    this.userList.splice(indexOfAddedUser, 1);     // Splice userList array and remove user
    this.filteredUserList = this.userList;
    this.inputFocus = false; 
  }

  removeaddedUser(userToAdd: any, i: number) {
      this.filteredUserList = this.userList;
      this.userList.push(userToAdd);             // Push to user List array
      this.newUsersToAdd.splice(i, 1);          // Splice newUsersToAdd array and remove user
      this.filteredUserList = this.userList;
      this.originalUserList = this.userList;
      this.inputFocus = false;
  }

  addUsers() {
    //this.channels[0].members.push(this.newMemberObject);
  }

  closeUserList() {
    this.inputFocus = false;
  }

}

