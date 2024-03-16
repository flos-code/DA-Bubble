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
      this.showDirectMessage.asObservable(),
    ]).pipe(
      map(
        ([showChannel, showDirectMessage]) => showChannel || showDirectMessage
      )
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

  private viewSettings = {
    extraSmall: {
      sidebar: {
        showSidebar: true,
        showChannel: false,
        showDirectMessage: false,
        showNewMessage: false,
        showSecondaryChat: false,
      },
      channel: {
        showSidebar: false,
        showChannel: true,
        showDirectMessage: false,
        showNewMessage: false,
        showSecondaryChat: false,
      },
      directMessage: {
        showSidebar: false,
        showChannel: false,
        showDirectMessage: true,
        showNewMessage: false,
        showSecondaryChat: false,
      },
      newMessage: {
        showSidebar: false,
        showChannel: false,
        showDirectMessage: false,
        showNewMessage: true,
        showSecondaryChat: false,
      },
      secondaryChat: {
        showSidebar: false,
        showChannel: false,
        showDirectMessage: false,
        showNewMessage: false,
        showSecondaryChat: true,
      },
    },
    small: {
      sidebar: {
        showSidebar: true,
        showChannel: false,
        showDirectMessage: false,
        showNewMessage: false,
        showSecondaryChat: false,
      },
      channel: {
        showSidebar: false,
        showChannel: true,
        showDirectMessage: false,
        showNewMessage: false,
        showSecondaryChat: false,
      },
      directMessage: {
        showSidebar: false,
        showChannel: false,
        showDirectMessage: true,
        showNewMessage: false,
        showSecondaryChat: false,
      },
      newMessage: {
        showSidebar: false,
        showChannel: false,
        showDirectMessage: false,
        showNewMessage: true,
        showSecondaryChat: false,
      },
      secondaryChat: {
        showSidebar: false,
        showChannel: false,
        showDirectMessage: false,
        showNewMessage: false,
        showSecondaryChat: true,
      },
    },
    medium: {
      sidebar: {
        showSidebar: true,
        showSidebarToggle: true,
        showSecondaryChat: false,
      },
      channel: {
        showSidebar: true,
        showSidebarToggle: true,
        showChannel: true,
        showDirectMessage: false,
        showNewMessage: false,
        showSecondaryChat: false,
      },
      directMessage: {
        showSidebar: true,
        showSidebarToggle: true,
        showChannel: false,
        showDirectMessage: true,
        showNewMessage: false,
        showSecondaryChat: false,
      },
      newMessage: {
        showSidebar: true,
        showSidebarToggle: true,
        showChannel: false,
        showDirectMessage: false,
        showNewMessage: true,
        showSecondaryChat: false,
      },
      secondaryChat: {
        showSidebar: true,
        showSidebarToggle: false,
        showChannel: true,
        showSecondaryChat: true,
      },
    },
    large: {
      sidebar: {
        showChannel: true,
        showSecondaryChat: false,
      },
      channel: {
        showChannel: true,
        showDirectMessage: false,
        showNewMessage: false,
        showSecondaryChat: false,
      },
      directMessage: {
        showSidebar: true,
        showChannel: false,
        showDirectMessage: true,
        showNewMessage: false,
        showSecondaryChat: false,
      },
      newMessage: {
        showSidebar: true,
        showChannel: false,
        showDirectMessage: false,
        showNewMessage: true,
        showSecondaryChat: false,
      },
      secondaryChat: {
        showSecondaryChat: true,
      },
    },
  };

  private updateViewProperties(properties: object): void {
    for (const key of Object.keys(properties)) {
      this[key].next(properties[key]);
    }
  }

  setView(
    view:
      | 'sidebar'
      | 'channel'
      | 'directMessage'
      | 'newMessage'
      | 'secondaryChat'
  ): void {
    let screenSize = this.screenSize.value;
    const settingsForSize = this.viewSettings[screenSize];
    if (!settingsForSize || !settingsForSize[view]) {
      return;
    }

    this.updateViewProperties(settingsForSize[view]);
  }
}
