import { Component, ElementRef, EventEmitter, Output, ViewChild, inject, NgModule, Pipe, PipeTransform, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-add-members-dialog',
  standalone: true,
  imports: [ MatIconModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatChipsModule, MatAutocompleteModule, CommonModule, FilterPipe ],
  templateUrl: './add-members-dialog.component.html',
  styleUrl: './add-members-dialog.component.scss'
})
export class AddMembersDialogComponent implements OnInit {
  
  ngOnInit(): void {

  }

  @Output() addMemberDialogOpenChild = new EventEmitter();
  addMemberDialogOpen: boolean;
  inputFocus: boolean = false;

  searchText: string = '';
  newUsersToAdd = [];
  userList = [{
    'id': 'sldajfl22',
    'name': 'Stefanie',
    'surname': 'Müller'
  },
  {
    'id': 'sldajfl22',
    'name': 'Tobias',
    'surname': 'Odermatt'
  },
  {
    'id': 'sldajfl22',
    'name': 'Filip',
    'surname': 'Neumann'
  },
  {
    'id': 'sldajfl22',
    'name': 'Elias',
    'surname': 'Neumann'
  }];

  filteredUserList = this.userList;
  originalUserList;

  searchKey(data:string) {
    this.searchText = data;
    this.search();
  }


  search() {
    this.originalUserList = this.userList;
    
    if(this.searchText !== "") {
        this.filteredUserList =  this.userList.filter( user =>  {
            return user.name.toLowerCase().includes(this.searchText) || user.surname.toLowerCase().includes(this.searchText);
        });

    } else {
      this.filteredUserList = this.userList;
    }
  }

  constructor() { }

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

  addUser(user: any, i: number) {
    this.newUsersToAdd.push(user); // Push user in newUsersToAdd array.
    this.userList.splice(i, 1)     // Splice userList array and remove user
    this.inputFocus = false;
    this.filteredUserList = this.userList;
  }

  removeaddedUser(user: any, i: number) {
    this.userList.push(user);         // Push to user List array
    this.newUsersToAdd.splice(i, 1);  // Splice newUsersToAdd array and remove user 
    this.inputFocus = false;
  }

  addUsers() {
    //this.channels[0].members.push(this.newMemberObject);
  }

  closeUserList() {
    this.inputFocus = false;
  }

}

