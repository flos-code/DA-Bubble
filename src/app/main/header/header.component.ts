import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  isOverlayActive: boolean = false;

  constructor() { }

  menuItemClicked(option: string) {
    console.log('Option clicked:', option);
  }

  toggleOverlay(active: boolean) {
    this.isOverlayActive = active;
  }
}
