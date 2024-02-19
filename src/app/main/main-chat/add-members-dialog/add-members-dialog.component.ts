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

  newUsersToAdd = [{
    'id': 'sldajfl22',
    'name': 'Elias',
    'surname': 'Neumann'
  }];

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
  }];

  filteredUserList = this.userList;
  searchText: string = '';

  searchKey(data:string) {
    this.searchText = data;
    this.search();
  }


  search() {
    let originalUserList = this.userList;

    if(this.searchText !== "") {
        this.filteredUserList = [];
        this.filteredUserList = this.userList.filter( user =>  {
            return user.name.toLowerCase().includes(this.searchText) || user.surname.toLowerCase().includes(this.searchText);
        });
           
    } else {
      this.filteredUserList = [];
      this.filteredUserList = originalUserList;
    }
  }

/* filteredFruits: Observable<string[]>;
fruits: string[] = ['Lemon'];
allFruits: string[] = ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry'];
 */



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

  addUser() {
    // Push user in newUsersToAdd array.
    // Splice List array and remove user
  }

  removeaddedUser(){
    // Push to user List array
    // Splice newUsersToAdd array and remove user
  }

  addUsers() {
    //this.channels[0].members.push(this.newMemberObject);
  }

}

