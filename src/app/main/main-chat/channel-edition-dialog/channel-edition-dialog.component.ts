import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../services/chat.service';
import { ViewManagementService } from '../../../services/view-management.service';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { ShowMembersDialogComponent } from '../show-members-dialog/show-members-dialog.component';
import { AddMembersDialogComponent } from '../add-members-dialog/add-members-dialog.component';

@Component({
  selector: 'app-channel-edition-dialog',
  standalone: true,
  imports: [ CommonModule, FormsModule, ShowMembersDialogComponent, AddMembersDialogComponent ],
  templateUrl: './channel-edition-dialog.component.html',
  styleUrl: './channel-edition-dialog.component.scss'
})
export class ChannelEditionDialogComponent implements OnInit {
  private firestore: Firestore = inject(Firestore);
  @Input() channelData!: any;
  @Input() currentChannelId!: string;
  @Input() channelCreatorName!: string;
  @Input() currentUser!: string;
  @Input() channelMembers!: any;
  channelEditionDialogOpen: boolean;
  @Output() channelEditionDialogOpenChild = new EventEmitter();
  showchannelEditionName: boolean = true;
  showchannelEditionDescription: boolean = true;
  editedChannelName: string;
  editedChannelDescription: string;
  showPopup: boolean = false;
  showPopupLeaveChannel: boolean = false;
  showPopupAdmin: boolean = false;
  showMembersInEditionDialog: boolean = false;
  editMobile: boolean = false;
  saveMobile: boolean = false;
  addMemberDialogOpen: boolean = false;
  addMembersMobileView: boolean = false;

  constructor(private chatService: ChatService, private viewManagementService: ViewManagementService) { }

  ngOnInit(): void {
    this.setMobileComponents();
  }

  setMobileComponents() {
    if(window.innerWidth <= 500){
      this.showMembersInEditionDialog = true;
      this.editMobile = true;
    } else {
      this.showMembersInEditionDialog = false;
      this.editMobile = false;
    }
  }

  editChannelName() {
    if(this.currentUser == this.channelData.createdBy) {
      this.showchannelEditionName = false;
    } else {
      this.showPopup = true;
      setTimeout(() => {
        this.showPopup = false;
      }, 4000);
    }
  }

  async saveChannelName() {
    if(this.editedChannelName) {
      let currentChannelRef = doc(this.firestore, 'channels', this.currentChannelId);
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
      }, 4000);
    }
  }

  async saveChannelDescription() {
    if(this.editedChannelDescription) {
      let currentChannelRef = doc(this.firestore, 'channels', this.currentChannelId);
      let data = {description: this.editedChannelDescription };
      await updateDoc(currentChannelRef, data).then(() => {
      });
      this.editedChannelDescription = "";
      this.showchannelEditionDescription = true;  
    } else {
      this.showchannelEditionDescription = true;  
    }
  }

  async leaveChannel() {
    if(this.currentUser == this.channelData.createdBy) {
      this.showPopupAdmin = true;
      setTimeout(() => {
        this.showPopupAdmin = false;
      }, 4000);
    } else {
      let index = this.channelData.members.indexOf(this.currentUser);
      this.channelData.members.splice(index, 1);
      let currentRef = doc(this.firestore, `channels/${this.currentChannelId}`);
      let data = {
        members: this.channelData.members
      };
      await updateDoc(currentRef, data).then(() => {
      }); 
      this.showPopupLeaveChannel = false;   
      this.channelEditionDialogOpen = false;
      this.channelEditionDialogOpenChild.emit(this.channelEditionDialogOpen);
      this.chatService.setActiveChannelId(null);
      this.chatService.setSelectedUserId(null);
      this.viewManagementService.setView('newMessage');  
    }
  }
  
  closeDialog() {
    this.channelEditionDialogOpen = false;
    this.channelEditionDialogOpenChild.emit(this.channelEditionDialogOpen)
  }

  openAskLeaveChannel() {
    this.showPopupLeaveChannel = true;
  }


  closePopupLeaveChannel() {
    this.showPopupLeaveChannel = false;
  }

  openAddMemberMobile(showAddMemberMobile: boolean) {
    this.addMemberDialogOpen = true;
    this.addMembersMobileView = true;
  }

  closeAddMemberMobile(addMemberDialogOpen: boolean) {
    this.addMemberDialogOpen = false;
  }

  doNotClose($event: any) {
    $event.stopPropagation(); 
  }
}
