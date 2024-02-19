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
  showMembersDialogOpen: boolean;


  doNotClose($event: any) {
    $event.stopPropagation(); 

  }

  closeDialog() {
    this.showMembersDialogOpen = false;
    this.showMembersDialogOpenChild.emit(this.showMembersDialogOpen)
  }
}
