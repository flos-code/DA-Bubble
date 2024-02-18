import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProfilCardComponent } from '../profil-card/profil-card.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  imports: [ProfilCardComponent, CommonModule]
})
export class HeaderComponent {
  isOverlayActive: boolean = false;
  currentUserProfil: boolean = false;
  showProfil: boolean = false;
  showDropdownMenu: boolean = false;

  constructor(public dialog: MatDialog) { }

  menuItemClicked(option: string) {
    console.log('Option clicked:', option);
  }

  toggleOverlay(active: boolean) {
    this.isOverlayActive = active;
    this.showDropdownMenu = active;
    this.showProfil = active;
  }

  toggleDropdownMenu(active: boolean) {
    this.showDropdownMenu = active;
    this.isOverlayActive = active;
  }

  openProfil(active: boolean): void {
    this.showProfil = active;
  }
}