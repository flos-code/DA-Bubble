import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-chat',
  standalone: true,
  imports: [],
  templateUrl: './main-chat.component.html',
  styleUrl: './main-chat.component.scss'
})
export class MainChatComponent {
    channels = [{
      'id': 'sijfef8e8',
      'name': 'Entwicklerteam',
      'members': [{
        'userId': 'sadf123sadf',
        'name': 'Tobias',
        'surname': 'Odermatt',
        'photo': '../../../assets/img/main-chat/member1.svg'
      },
      {
        'userId': 'iej896sdf',
        'name': 'Pierce',
        'surname': 'C.',
        'photo': '../../../assets/img/main-chat/member2.svg'
      },
      {
        'userId': 'sadmvkui25ddf',
        'name': 'Filip',
        'surname': 'Todoroski',
        'photo': '../../../assets/img/main-chat/member3.svg'
      }
      ]
    }];

    membercount = this.channels[0]['members'].length;

    constructor(private common: CommonModule) {

    }
  
}
