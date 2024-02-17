import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dialog-add-channel',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './dialog-add-channel.component.html',
  styleUrl: './dialog-add-channel.component.scss',
})
export class DialogAddChannelComponent {
  @Input() isVisible: boolean = false;
  @Output() toggleVisibility = new EventEmitter<void>();

  inputFocused: boolean = false;

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
}
