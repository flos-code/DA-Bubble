import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ScreenSize = 'extraSmall' | 'small' | 'medium' | 'large';

@Injectable({
  providedIn: 'root',
})
export class ViewManagementService {
  private currentView = new BehaviorSubject<'showMainChat' | 'showNewMessage'>(
    'showMainChat'
  );
  currentView$ = this.currentView.asObservable();

  private screenSize = new BehaviorSubject<ScreenSize>('large');
  screenSize$ = this.screenSize.asObservable();

  constructor() {
    this.updateScreenSize(window.innerWidth);
    this.handleWindowResize();
  }

  changeView(view: 'showMainChat' | 'showNewMessage'): void {
    this.currentView.next(view);
  }

  private updateScreenSize(width: number): void {
    if (width <= 500) {
      this.screenSize.next('extraSmall');
    } else if (width > 500 && width <= 1100) {
      this.screenSize.next('small');
    } else if (width > 1100 && width <= 1400) {
      this.screenSize.next('medium');
    } else {
      this.screenSize.next('large');
    }
  }

  private handleWindowResize(): void {
    window.addEventListener('resize', () => {
      this.updateScreenSize(window.innerWidth);
    });
  }

  //ausgewählte userId oder channelId muss hier übertragen werden um in jeweiligen
  //componente dann auf passende collection zuzugreifen
}
