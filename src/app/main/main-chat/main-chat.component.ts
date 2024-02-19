import { Component, ElementRef, ViewChild, inject, Input } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipEditedEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { AsyncPipe } from '@angular/common';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ChannelEditionDialogComponent } from './channel-edition-dialog/channel-edition-dialog.component';

export interface Fruit {
  name: string;
}

@Component({
  selector: 'app-main-chat',
  standalone: true,
  imports: [ CommonModule, FormsModule, MatIconModule, MatChipsModule, ReactiveFormsModule, MatAutocompleteModule, MatFormFieldModule,
  ChannelEditionDialogComponent ],
  templateUrl: './main-chat.component.html',
  styleUrl: './main-chat.component.scss'
})
export class MainChatComponent {
    textArea: string = "";
    showChannel: boolean = true;
    addMemberDialogOpen: boolean = false;
    channelEditionDialogOpen: boolean = false;
    showMembersDialogOpen: boolean = false;

    newMember: string = "";
    newMemberObject = {
      'userId': 'ikeikeoie',
      'name': this.newMember,
      'surname': 'M.',
      'photo': '../../../assets/img/main-chat/member2.svg'
    };

    @Input() channels = [{
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

    /* ===================== ADD MEMBER ===================== */
    separatorKeysCodes: number[] = [ENTER, COMMA];
    fruitCtrl = new FormControl('');
    filteredFruits: Observable<string[]>;
    fruits: string[] = ['Lemon'];
    allFruits: string[] = ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry'];
  
    @ViewChild('fruitInput') fruitInput!: ElementRef<HTMLInputElement>;
      
    announcer = inject(LiveAnnouncer);
    /* ====================================================== */


    constructor() {
      this.filteredFruits = this.fruitCtrl.valueChanges.pipe(
        startWith(null),
        map((fruit: string | null) => (fruit ? this._filter(fruit) : this.allFruits.slice())),
      );
     }

    toggleDialog(dialog: string) {
      if(dialog == 'addMember'){
        if(this.addMemberDialogOpen == false) {
          this.addMemberDialogOpen = true;
        } else {
          this.addMemberDialogOpen = false;
        }
      } else if(dialog == 'channelEdition') {
        if(this.channelEditionDialogOpen == false) {
          this.channelEditionDialogOpen = true;
        } else {
          this.channelEditionDialogOpen = false;
        }
      } else if(dialog == 'showMembers') {
        if(this.showMembersDialogOpen == false) {
          this.showMembersDialogOpen = true;
        } else {
          this.showMembersDialogOpen = false;
        }
      }
    }

    addMember() {
      this.channels[0].members.push(this.newMemberObject);
    }

    closeDialog() {
      this.addMemberDialogOpen = false;
      this.channelEditionDialogOpen = false;
      this.showMembersDialogOpen = false;
    }

    doNotClose($event: any) {
      $event.stopPropagation(); 
    }

  /* ===================== ADD MEMBER ===================== */
  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
      this.fruits.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();

    this.fruitCtrl.setValue(null);
  }

  remove(fruit: string): void {
    const index = this.fruits.indexOf(fruit);

    if (index >= 0) {
      this.fruits.splice(index, 1);

      this.announcer.announce(`Removed ${fruit}`);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.fruits.push(event.option.viewValue);
    this.fruitInput.nativeElement.value = '';
    this.fruitCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allFruits.filter(fruit => fruit.toLowerCase().includes(filterValue));
  }
  
}
