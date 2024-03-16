import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent {
  animationState = 'in';

  constructor(
    private router: Router
  ) { }

  openLogin() {
    this.animationState = 'out';
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 850);
  }
}
