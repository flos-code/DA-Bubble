import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  // Verwendung von BehaviorSubject, um den initialen Zustand von threadOpen zu speichern
  private threadOpenSource = new BehaviorSubject<boolean>(false);
  
  // Exposition eines Observables, auf das Komponenten abonnieren können
  threadOpen$ = this.threadOpenSource.asObservable();

  private activeChannelId: string;

  constructor() { }

  // Methode zum Öffnen des Threads
  openThread(): void {
    this.threadOpenSource.next(true);
  }

  // Methode zum Schließen des Threads
  closeThread(): void {
    this.threadOpenSource.next(false);
  }

  setActiveChannelId(channelId: string) {
    this.activeChannelId = channelId;
    console.log(`Aktiver Channel: ${this.activeChannelId}`);
  }

  getActiveChannelId(): string {
    return this.activeChannelId;
  }
}
