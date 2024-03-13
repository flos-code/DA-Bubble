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
import { ProfilCardComponent } from './profil-card/profil-card.component';
import { ProfilCardService } from '../services/profil-card.service';
import { ChatService } from '../services/chat.service';

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
    ProfilCardComponent,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {
  showMainChat: boolean = true;
  showNewMessage: boolean = false;
  // showSecondaryChat: boolean = false;
  // showSidebar: boolean = false;
  
  private viewChangeSubscription: Subscription;

  subscription: Subscription = new Subscription();
  threadOpen: boolean = false;

  constructor(
    public chatService: ChatService,
    private viewManagementService: ViewManagementService,
    public serviceProfilCard: ProfilCardService
  ) {
    this.viewChangeSubscription =
      this.viewManagementService.currentView$.subscribe((view) => {
        this.showMainChat = view === 'showMainChat';
        this.showNewMessage = view === 'showNewMessage';
      });

    this.getThreadOpenStatus();
  }

  ngOnDestroy(): void {
    this.viewChangeSubscription.unsubscribe();
  }

  getThreadOpenStatus(): void {
    this.subscription.add(
      this.chatService.threadOpen$.subscribe((open) => {
        this.threadOpen = open;
      })
    );
  }
}
