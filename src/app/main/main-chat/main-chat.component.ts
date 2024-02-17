import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-main-chat',
  standalone: true,
  imports: [ CommonModule, FormsModule ],
  templateUrl: './main-chat.component.html',
  styleUrl: './main-chat.component.scss'
})
export class MainChatComponent {
    showChannel: boolean = false;
    addMemberDialogOpen: boolean = false;
    newMember: string = "";
    newMemberObject = {
      'userId': 'ikeikeoie',
      'name': this.newMember,
      'surname': 'M.',
      'photo': '../../../assets/img/main-chat/member2.svg'
    };

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
      ],
      'messages': [{
        'from': 'sadf123sadf',
        'createDate': '10.02.2024',
        'message': 'Hallo Zusammen, ich habe ein Frage zu Angular',
        'threads': [{'message': 'Was für eine Frage hast du genau?'}],
        'reactions': [{'reactedBy': 'sadmvkui25ddf', 'ractionName': 'rocket', 'iconPath': '../../../assets/img/main-chat/arrowDownDefault.svg'}]
      }]
    }];

    users = [{
      'userId': 'sadmvkui25ddf',
      'name': 'Filip',
      'surname': 'Todoroski',
      'photo': '../../../assets/img/main-chat/member1.svg',
      'onlineStatus': 'online'
      },
      {        'userId': 'sadf123sadf',
      'name': 'Tobias',
      'surname': 'Odermatt',
      'photo': '../../../assets/img/main-chat/member2.svg',
      'onlineStatus': 'idle'
      },
      {
        'userId': 'iej896sdf',
        'name': 'Pierce',
        'surname': 'C.',
        'photo': '../../../assets/img/main-chat/member3.svg',
        'onlineStatus': 'busy'
      },
      {
        'userId': 'okokloilk366',
        'name': 'Pascal',
        'surname': 'M.',
        'photo': '../../../assets/img/main-chat/member1.svg',
        'onlineStatus': 'away'
      },
      {
        'userId': 'sadfsadf8585',
        'name': 'Florian',
        'surname': 'Scholz',
        'photo': '../../../assets/img/main-chat/member2.svg',
        'onlineStatus': 'online'
      },  
    ];

    membercount = this.channels[0]['members'].length;

    constructor() { }

    toggleAddMemberDialog() {
      if(this.addMemberDialogOpen == false) {
        this.addMemberDialogOpen = true;
      } else {
        this.addMemberDialogOpen = false;
      }
    }

    closeAddMemberDialog() {
        this.addMemberDialogOpen = false;
    }

    addMember() {
      this.channels[0].members.push(this.newMemberObject);
    }
  
}
