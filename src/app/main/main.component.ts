import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { SecondaryChatComponent } from './main-chat/secondary-chat/secondary-chat.component';
import { MainChatComponent } from './main-chat/main-chat.component';
import { NewMessageComponent } from './new-message/new-message.component';
import { CommonModule } from '@angular/common';
import { EmojiPickerComponent } from './emoji-picker/emoji-picker.component';
import { ViewManagementService } from '../services/view-management.service';
import { Subscription } from 'rxjs';

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
  private viewChangeSubscription: Subscription;

  constructor(private viewManagementService: ViewManagementService) {
    this.viewChangeSubscription =
      this.viewManagementService.currentView$.subscribe((view) => {
        this.showMainChat = view === 'showMainChat';
        this.showDms = view === 'showDms';
        this.showNewMessage = view === 'showNewMessage';
      });
  }

  ngOnDestroy(): void {
    this.viewChangeSubscription.unsubscribe();
  }
}
