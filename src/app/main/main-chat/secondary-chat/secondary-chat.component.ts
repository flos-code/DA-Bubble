import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent, EmojiEvent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { ChatService } from '../../../services/chat.service';

@Component({
  selector: 'app-secondary-chat',
  standalone: true,
  imports: [PickerComponent, EmojiComponent, CommonModule],
  templateUrl: './secondary-chat.component.html',
  styleUrl: './secondary-chat.component.scss'
})
export class SecondaryChatComponent { 
  emojiWindowOpen = false;
  threadOpen: boolean = true;

  messages = [
    {
      id: 1,
      message: 'Welche Version ist aktuell von Angular?',
      sender: 'user',
      time: '14:25',
      own: false
    },
    {
      id: 2,
      message: 'Ich habe die gleiche Frage. Ich habe gegoogelt und es scheint, dass die aktuelle Version Angular 13 ist. Vielleicht weiß Frederik, ob es wahr ist.',
      sender: 'user',
      time: '14:30',
      own: false
    },
    {
      id: 3,
      message: 'Ja das ist es.',
      sender: 'user',
      time: '15:06',
      own: false
    }
  ];
  DialogRef: any;

  constructor(private chatService: ChatService) { }

  handleClick($event: EmojiEvent) {
    console.log($event.emoji);
  }

  emojiFilter(e: string): boolean {
    // Can use this to test [emojisToShowFilter]
    if (e && e.indexOf && e.indexOf('1F4') >= 0) {
      return true;
    }
    return false;
  }

  toggleEmojis() {
    if (this.emojiWindowOpen) {
      this.emojiWindowOpen = false;
    } else {
      this.emojiWindowOpen = true;
    }
  }

  closeThread(): void {
    this.chatService.closeThread();
  }
}
