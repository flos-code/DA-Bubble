import { Component } from '@angular/core';
import { TextBoxComponent } from './text-box/text-box.component';

@Component({
  selector: 'app-new-message',
  standalone: true,
  imports: [TextBoxComponent],
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss',
})
export class NewMessageComponent {}
