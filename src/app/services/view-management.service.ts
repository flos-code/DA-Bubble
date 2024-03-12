import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ViewManagementService {
  private currentView = new BehaviorSubject<
    'showMainChat' | 'showDms' | 'showNewMessage'
  >('showMainChat');
  currentView$ = this.currentView.asObservable();

  private currentMobileView = new BehaviorSubject<
    'sidebar' | 'mainchat' | 'secondarychat'
  >('mainchat');
  currentMobileView$ = this.currentView.asObservable();

  constructor() { }

  changeView(view: 'showMainChat' | 'showDms' | 'showNewMessage'): void {
    this.currentView.next(view);
  }

  changeMobileView(channelSelected: boolean, threadSelected: boolean): void {
    if (threadSelected) {
      this.currentMobileView.next('secondarychat');
    } else if (channelSelected) {
      this.currentMobileView.next('mainchat');
    } else {
      this.currentMobileView.next('sidebar');
    }
  }

  //ausgewählte userId oder channelId muss hier übertragen werden um in jeweiligen
  //componente dann auf passende collection zuzugreifen
}
