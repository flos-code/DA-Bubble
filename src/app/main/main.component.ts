import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { SecondaryChatComponent } from './secondary-chat/secondary-chat.component';
import { MainChatComponent } from './main-chat/main-chat.component';
import { NewMessageComponent } from './new-message/new-message.component';
import { CommonModule } from '@angular/common';

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
}
