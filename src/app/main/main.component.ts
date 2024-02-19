import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { SecondaryChatComponent } from './main-chat/secondary-chat/secondary-chat.component';
import { MainChatComponent } from './main-chat/main-chat.component';
import { NewMessageComponent } from './new-message/new-message.component';
import { CommonModule } from '@angular/common';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { EmojiPickerComponent } from './emoji-picker/emoji-picker.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    SideBarComponent,
    MainChatComponent,
    SecondaryChatComponent,
    NewMessageComponent,
    EmojiPickerComponent,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {
  showMainChat: boolean = true;
  showDms: boolean = false;
  showNewMessage: boolean = false;

  setActiveView(view: 'showMainChat' | 'showDms' | 'showNewMessage'): void {
    this.showMainChat = view === 'showMainChat';
    this.showDms = view === 'showDms';
    this.showNewMessage = view === 'showNewMessage';
  }

  handleEmojiSelect(emoji: any) {
    console.log('Selected emoji:', emoji);
    // Implement your logic to use the selected emoji
  }
}
