import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
import { Router } from '@angular/router';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { environment } from '../../environments/environment.private';

const app = initializeApp(environment.firebase);

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
export class MainComponent implements OnInit {
  auth = getAuth(app);
  subscription: Subscription = new Subscription();
  threadOpen: boolean = false;
  userLoaded: boolean = false;

  constructor(
    public chatService: ChatService,
    public viewManagementService: ViewManagementService,
    public serviceProfilCard: ProfilCardService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    onAuthStateChanged(this.auth, (user) => {
      if (!user) {
        this.router.navigateByUrl('/login');
      } else {
        this.userLoaded = true;
        this.cdr.detectChanges();
      }
    });
  }
}
