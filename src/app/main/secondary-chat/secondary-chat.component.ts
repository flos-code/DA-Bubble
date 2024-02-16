import { Component } from '@angular/core';

@Component({
  selector: 'app-secondary-chat',
  standalone: true,
  imports: [],
  templateUrl: './secondary-chat.component.html',
  styleUrl: './secondary-chat.component.scss'
})
export class SecondaryChatComponent {
  threadContent =
    {
      id: 1,
      message: 'Welche Version ist aktuell von Angular?',
      sender: 'user',
      time: '14:25'
    }

  constructor() { }
}
