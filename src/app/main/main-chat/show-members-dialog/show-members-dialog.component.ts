import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-show-members-dialog',
  standalone: true,
  imports: [],
  templateUrl: './show-members-dialog.component.html',
  styleUrl: './show-members-dialog.component.scss'
})
export class ShowMembersDialogComponent {
  @Output() showMembersDialogOpenChild = new EventEmitter();
  @Output() addMembersDialogOpenOpenChildShow = new EventEmitter();

  showMembersDialogOpen: boolean;
  addMemberDialogOpen: boolean;


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
