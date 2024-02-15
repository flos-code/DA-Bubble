import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { SecondaryChatComponent } from './secondary-chat/secondary-chat.component';
import { MainChatComponent } from './main-chat/main-chat.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [HeaderComponent, SideBarComponent, MainChatComponent, SecondaryChatComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {

}
