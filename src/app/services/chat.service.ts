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

  constructor() { }

  // Methode zum Öffnen des Threads
  openThread(): void {
    this.threadOpenSource.next(true);
  }

  // Methode zum Schließen des Threads
  closeThread(): void {
    this.threadOpenSource.next(false);
  }
}
