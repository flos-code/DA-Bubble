import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';

export type ScreenSize = 'extraSmall' | 'small' | 'medium' | 'large';

@Injectable({
  providedIn: 'root',
})
export class ViewManagementService {


  private screenSize = new BehaviorSubject<ScreenSize>('large');
  screenSize$ = this.screenSize.asObservable();

  private showChannel = new BehaviorSubject<boolean>(false);
  showChannel$ = this.showChannel.asObservable();

  private showDirectMessage = new BehaviorSubject<boolean>(false);
  showDirectMessage$ = this.showDirectMessage.asObservable();

  private showNewMessage = new BehaviorSubject<boolean>(false);
  showNewMessage$ = this.showNewMessage.asObservable();

  private showSidebar = new BehaviorSubject<boolean>(true);
  showSidebar$ = this.showSidebar.asObservable();

  private showSecondaryChat = new BehaviorSubject<boolean>(false);
  showSecondaryChat$ = this.showSecondaryChat.asObservable();

  private showSidebarToggle = new BehaviorSubject<boolean>(true);
  showSidebarToggle$ = this.showSidebarToggle.asObservable();

  public showMainChat$: Observable<boolean>;

  constructor() {
    this.updateScreenSize(window.innerWidth);
    this.handleWindowResize();

    this.showMainChat$ = combineLatest([
      this.showChannel.asObservable(),
      this.showDirectMessage.asObservable()
    ]).pipe(
      map(([showChannel, showDirectMessage]) => showChannel || showDirectMessage)
    );
  
  }



  updateScreenSize(width: number): void {
    if (width <= 500) {
      this.screenSize.next('extraSmall');
    } else if (width > 500 && width <= 1110) {
      this.screenSize.next('small');
    } else if (width > 1110 && width <= 1500) {
      this.screenSize.next('medium');
    } else {
      this.screenSize.next('large');
    }
  }

  handleWindowResize(): void {
    window.addEventListener('resize', () => {
      this.updateScreenSize(window.innerWidth);
    });
  }


  setView(
    view:
      | 'sidebar'
      | 'channel'
      | 'directMessage'
      | 'newMessage'
      | 'secondaryChat'
  ): void {
    const currentScreenSize = this.screenSize.value;
    if (currentScreenSize === 'small' || currentScreenSize === 'extraSmall') {
      if (view === 'sidebar') {
        this.showSidebar.next(true);
        this.showChannel.next(false);
        this.showDirectMessage.next(false);
        this.showNewMessage.next(false);
        this.showSecondaryChat.next(false);
      } else if (view === 'channel') {
        this.showSidebar.next(false);
        this.showChannel.next(true);
        this.showDirectMessage.next(false);
        this.showNewMessage.next(false);
        this.showSecondaryChat.next(false);
      } else if (view === 'directMessage') {
        this.showSidebar.next(false);
        this.showChannel.next(false);
        this.showNewMessage.next(false);
        this.showDirectMessage.next(true);
        this.showSecondaryChat.next(false);
      } else if (view === 'newMessage') {
        this.showSidebar.next(false);
        this.showChannel.next(false);
        this.showDirectMessage.next(false);
        this.showNewMessage.next(true);
        this.showSecondaryChat.next(false);
      } else if (view === 'secondaryChat') {
        this.showSidebar.next(false);
        this.showChannel.next(false);
        this.showDirectMessage.next(false);
        this.showNewMessage.next(false);
        this.showSecondaryChat.next(true);
      }
    } else if (currentScreenSize === 'medium') {
      if (view === 'sidebar') {
        this.showSidebar.next(true);
        this.showSidebarToggle.next(true);

        this.showSecondaryChat.next(false);

      } else if (view === 'channel') {
        this.showSidebar.next(true);
        this.showSidebarToggle.next(true);
        this.showChannel.next(true);
        this.showSecondaryChat.next(false);
        this.showDirectMessage.next(false);
        this.showNewMessage.next(false);
      } else if (view === 'directMessage') {
        this.showSidebar.next(true);
        this.showSidebarToggle.next(true);
        this.showChannel.next(false);
        this.showDirectMessage.next(true);
        this.showSecondaryChat.next(false);
        this.showNewMessage.next(false);
      } else if (view === 'newMessage') {
        this.showSidebar.next(true);
        this.showSidebarToggle.next(true);
        this.showChannel.next(false);
        this.showDirectMessage.next(false);
        this.showSecondaryChat.next(false);
        this.showNewMessage.next(true);
      } else if (view === 'secondaryChat') {
        this.showSidebar.next(true);
        this.showSidebarToggle.next(false);
        this.showChannel.next(true);
        this.showSecondaryChat.next(true);
      }
    } else if (currentScreenSize === 'large') {
      if (view === 'sidebar') {
        this.showChannel.next(true);
        this.showSecondaryChat.next(false);
      } else if (view === 'channel') {
        this.showChannel.next(true);
        this.showSecondaryChat.next(false);
        this.showNewMessage.next(false);
        this.showDirectMessage.next(false);
      } else if (view === 'directMessage') {
        this.showSidebar.next(true);
        this.showChannel.next(false);
        this.showDirectMessage.next(true);
        this.showNewMessage.next(false);
        this.showSecondaryChat.next(false);

      } else if (view === 'newMessage') {
        this.showSidebar.next(true);
        this.showChannel.next(false);
        this.showDirectMessage.next(false);
        this.showSecondaryChat.next(false);
        this.showNewMessage.next(true);
      } else if (view === 'secondaryChat') {
        this.showSecondaryChat.next(true);
      }
    }

    console.log(
      this.showSidebar.value,
      currentScreenSize
    )
  }
}
