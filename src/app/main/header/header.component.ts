import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProfilCardComponent } from '../profil-card/profil-card.component';
import { CommonModule } from '@angular/common';
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
import { Router } from '@angular/router';
import { ProfilCardService } from '../../services/profil-card.service';
import { MatIconModule } from '@angular/material/icon';

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
  imports: [ProfilCardComponent, CommonModule, MatIconModule]
})
export class HeaderComponent implements OnInit {
  authSubscription: any;

  ngOnInit(): void {
    this.getTheLoggedInUser();
  }

  auth = getAuth(app);
  userNameandSurname: string = '';
  profilePic: string = '';
  userId: string = '';

  isOverlayActive: boolean = false;
  currentUserProfil: boolean = false;
  showProfil: boolean = false;
  showDropdownMenu: boolean = false;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    public serviceProfilCard: ProfilCardService,
  ) {
    this.serviceProfilCard.isProfilCardActiveChanged.subscribe((isActive: boolean) => {
      this.showDropdownMenu = isActive; // Update local variable when service variable changes
    });
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


  getTheLoggedInUser() {
    this.authSubscription = this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.profilePic = user.photoURL;
        this.userNameandSurname = user.displayName;
        this.changeProfilePicVariable();
      } else {
        this.profilePic = '/assets/img/login/profile_generic_big.png';
        this.userNameandSurname = 'Max Mustermann';
      }
    });
  }

  changeProfilePicVariable() {
    if (this.profilePic == 'one') {
      this.profilePic = '/assets/img/userImages/userImage1.svg'
    } else if (this.profilePic == 'two') {
      this.profilePic = '/assets/img/userImages/userImage2.svg'
    } else if (this.profilePic == 'three') {
      this.profilePic = '/assets/img/userImages/userImage3.svg'
    } else if (this.profilePic == 'four') {
      this.profilePic = '/assets/img/userImages/userImage4.svg'
    } else if (this.profilePic == 'five') {
      this.profilePic = '/assets/img/userImages/userImage5.svg'
    } else if (this.profilePic == 'six') {
      this.profilePic = '/assets/img/userImages/userImage6.svg'
    }
  }
}