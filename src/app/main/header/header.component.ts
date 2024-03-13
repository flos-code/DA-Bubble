import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProfilCardComponent } from '../profil-card/profil-card.component';
import { CommonModule } from '@angular/common';
import { initializeApp } from "firebase/app";
import { collection, getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
import { Router } from '@angular/router';
import { ProfilCardService } from '../../services/profil-card.service';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../../services/search.service';

const firebaseConfig = {
  apiKey: "AIzaSyC520Za3P8qTUGvWM0KxuYqGIMaz-Vd48k",
  authDomain: "da-bubble-87fea.firebaseapp.com",
  projectId: "da-bubble-87fea",
  storageBucket: "da-bubble-87fea.appspot.com",
  messagingSenderId: "970901942782",
  appId: "1:970901942782:web:56b67253649b6206f290af"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  imports: [ProfilCardComponent, CommonModule, MatIconModule, FormsModule]
})
export class HeaderComponent implements OnInit {
  authSubscription: any;

  ngOnInit(): void {
    this.checkIfGuest();
  }

  auth = getAuth(app);
  userNameandSurname: string = '';
  profilePic: string = '';
  userId: string = '';
  headerUserNameandSurname: string;
  headerProfilePic: string;
  currentUser;

  isOverlayActive: boolean = false;
  currentUserProfil: boolean = false;
  showProfil: boolean = false;
  showDropdownMenu: boolean = false;
  inputValue: string = ''; // Initialisierung der Variable
  loggedInAsGuest: boolean = true;

  firebaseConfig = {
    apiKey: "AIzaSyC520Za3P8qTUGvWM0KxuYqGIMaz-Vd48k",
    authDomain: "da-bubble-87fea.firebaseapp.com",
    projectId: "da-bubble-87fea",
    storageBucket: "da-bubble-87fea.appspot.com",
    messagingSenderId: "970901942782",
    appId: "1:970901942782:web:56b67253649b6206f290af"
  };
  app = initializeApp(this.firebaseConfig);
  db = getFirestore(this.app);
  userRef = collection(this.db, 'users');

  constructor(
    public dialog: MatDialog,
    private router: Router,
    public serviceProfilCard: ProfilCardService,
    public searchService: SearchService,
  ) {
    this.serviceProfilCard.isProfilCardActiveChanged.subscribe((isActive: boolean) => {
      this.showDropdownMenu = isActive; // Update local variable when service variable changes
    });
  }

  onInputChange() {
    this.searchService.searchUsers(this.inputValue);
    this.searchService.searchChannels(this.inputValue);
    this.searchService.searchThreads(this.inputValue);
    // console.log(this.searchService.threads);
  }

  searchUsers() {

  }

  isInputValueGreaterThanOne(): boolean {
    return this.inputValue.length > 0;
  }

  menuItemClicked(option: string) {
    console.log('Option clicked:', option);
  }

  toggleOverlay(active: boolean) {
    this.isOverlayActive = active;
    this.showDropdownMenu = active;
  }

  toggleDropdownMenu(active: boolean) {
    this.showDropdownMenu = active;
    // this.isOverlayActive = active;
    if (!this.serviceProfilCard.isProfilCardActive) {
      this.serviceProfilCard.isOverlayActive = active;
    }
  }

  openProfil(active: boolean): void {
    this.showProfil = active;
  }

  signOut() {
    this.auth.signOut();
    this.router.navigateByUrl('login');
    this.serviceProfilCard.isOverlayActive = false;
  }


  ///////////////////////// closes the resultFeld when clicking outside of it /////////////////////////

  onDocumentClick(event: MouseEvent) {
    const clickedElement = event.target as HTMLElement;
    const isClickedOutside = !this.isDescendant(clickedElement, 'searchField');
    if (isClickedOutside) {
      this.inputValue = '';
    }
  }

  private isDescendant(element: HTMLElement, className: string): boolean {
    if (!element) return false;

    if (element.classList.contains(className)) {
      return true;
    } else {
      return this.isDescendant(element.parentElement, className);
    }
  }

  checkIfGuest() {
    if (this.serviceProfilCard.currentUserId === 'qAspx2yXBnc0WtnBRJgVJsDniPC3') {
      this.loggedInAsGuest = true;
    } else {
      this.loggedInAsGuest = false;
    }
  }
}