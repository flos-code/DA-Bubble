import { Component } from '@angular/core';
import { ProfilCardService } from '../../services/profil-card.service';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-profil-card',
  standalone: true,
  imports: [CommonModule, MatIcon],
  templateUrl: './profil-card.component.html',
  styleUrl: './profil-card.component.scss'
})
export class ProfilCardComponent {
  edit: boolean = false;

  constructor(public serviceProfilCard: ProfilCardService) {
  }

  toggleEdit(active: boolean) {
    this.edit = active;
  }
}
