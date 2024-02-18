import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dialog-add-user-new-channel',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './dialog-add-user-new-channel.component.html',
  styleUrl: './dialog-add-user-new-channel.component.scss',
})
export class DialogAddUserNewChannelComponent {
  @Input() isVisible: boolean = false;
  @Output() toggleVisibility = new EventEmitter<void>();
  @ViewChild('form') form!: NgForm;

  userSelection: string = 'allMembers';
  addedUser: string = '';

  toggle(): void {
    this.toggleVisibility.emit();
  }
  stopPropagation(event: MouseEvent) {
    event.stopPropagation();
  }

  addUser(): void {
    // Handle form submission
    console.log(
      'selected option:',
      this.userSelection,
      'selecteduser:',
      this.addedUser
    );

    this.toggle();
  }

  shouldDisableSubmit(): boolean {
    return this.userSelection === 'specificPeople' && !this.addedUser;
  }
}
