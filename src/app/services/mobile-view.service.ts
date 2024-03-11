import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MobileViewService {
  private currentView = new BehaviorSubject<
    'sidebar' | 'mainchat' | 'secondarychat'
  >('mainchat');
  currentView$ = this.currentView.asObservable();

  constructor() {}

  changeView(channelSelected: boolean, threadSelected: boolean): void {
    if (threadSelected) {
      this.currentView.next('secondarychat');
    } else if (channelSelected) {
      this.currentView.next('mainchat');
    } else {
      this.currentView.next('sidebar');
    }
  }
}
