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
  selector: 'app-dialog-add-channel',
  standalone: true,
  imports: [MatIconModule, FormsModule],
  templateUrl: './dialog-add-channel.component.html',
  styleUrl: './dialog-add-channel.component.scss',
})
export class DialogAddChannelComponent {
  @Input() isVisible: boolean = false;
  @Output() toggleVisibility = new EventEmitter<void>();
  @Output() onChannelCreation = new EventEmitter<{
    name: string;
    description: string;
  }>();
  @ViewChild('form') form!: NgForm;

  inputFocused: boolean = false;
  channelNameModel: string = '';
  channelDescriptionModel: string = '';

  toggle(): void {
    this.toggleVisibility.emit();
  }
  stopPropagation(event: MouseEvent) {
    event.stopPropagation();
  }

  onInputFocus(): void {
    this.inputFocused = true;
  }

  onInputBlur(): void {
    this.inputFocused = false;
  }

  createChannel(): void {
    if (this.form?.valid) {
      // Sendet die Kanaldaten an die übergeordnete Komponente
      this.onChannelCreation.emit({
        name: this.channelNameModel,
        description: this.channelDescriptionModel,
      });
      this.toggle(); // Schließt das Dialogfenster
    } else {
      console.log('Form not valid');
    }
  }
}
