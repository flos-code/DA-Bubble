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

  constructor() {}

  changeView(view: 'showMainChat' | 'showDms' | 'showNewMessage'): void {
    this.currentView.next(view);
  }

  //ausgewählte userId oder channelId muss hier übertragen werden um in jeweiligen
  //componente dann auf passende collection zuzugreifen
}
