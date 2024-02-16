import { Component } from '@angular/core';
// import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-header',
  standalone: true,
  // imports: [MatMenuModule],
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
