import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProfilCardService {

  isProfilCardActive: boolean = false;
  isOverlayActive: boolean = false;
  isCurrentUserActive: boolean;
  isProfilCardActiveChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor() { }

  toggleCardOverlay(active: boolean) {
    this.isOverlayActive = active;
    console.log('Passt!');
    this.isProfilCardActiveChanged.emit(active); // Emit event when the variable changes
    if (this.isProfilCardActive) {
      this.isProfilCardActive = false;
    }
  }

  toggleProfilCard(active: boolean, currentUser: boolean) {
    this.isProfilCardActive = active;
    this.isCurrentUserActive = currentUser;
  }
}
