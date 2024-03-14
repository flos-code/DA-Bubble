import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
} from 'firebase/firestore';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { DirectMessage } from '../../models/directMessage.class';

const firebaseConfig = {
  apiKey: 'AIzaSyC520Za3P8qTUGvWM0KxuYqGIMaz-Vd48k',
  authDomain: 'da-bubble-87fea.firebaseapp.com',
  projectId: 'da-bubble-87fea',
  storageBucket: 'da-bubble-87fea.appspot.com',
  messagingSenderId: '970901942782',
  appId: '1:970901942782:web:56b67253649b6206f290af',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
})
export class SignUpComponent {
  auth = getAuth(app);

  first: boolean = true;
  second: boolean = false;
  person: string = 'zero';
  current: Date = new Date();
  uID: string = '';
  userCreationSuccess: boolean = false;

  genericImg: string = '/assets/img/login/profile_generic_big.png';
  person1Img: string = '/assets/img/userImages/userImage1.svg';
  person2Img: string = '/assets/img/userImages/userImage2.svg';
  person3Img: string = '/assets/img/userImages/userImage3.svg';
  person4Img: string = '/assets/img/userImages/userImage4.svg';
  person5Img: string = '/assets/img/userImages/userImage5.svg';
  person6Img: string = '/assets/img/userImages/userImage6.svg';
  imgUrl: string = this.genericImg;

  registerForm = this.fb.group({
    nameAndSurname: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    checkbox: [false, Validators.requiredTrue],
  });

  constructor(private router: Router, private fb: FormBuilder) {}

  goBackToLogin() {
    this.router.navigateByUrl('login');
  }

  goBackToFirst() {
    this.first = true;
    this.second = false;
  }

  getNotesRef() {
    return collection(db, 'users');
  }

  goToAvatarChoice() {
    this.first = false;
    this.second = true;
  }

  chooseAvatar(person: number) {
    if (person == 1) {
      this.imgUrl = this.person1Img;
      this.person = this.person1Img;
    } else if (person == 2) {
      this.imgUrl = this.person2Img;
      this.person = this.person2Img;
    } else if (person == 3) {
      this.imgUrl = this.person3Img;
      this.person = this.person3Img;
    } else if (person == 4) {
      this.imgUrl = this.person4Img;
      this.person = this.person4Img;
    } else if (person == 5) {
      this.imgUrl = this.person5Img;
      this.person = this.person5Img;
    } else if (person == 6) {
      this.imgUrl = this.person6Img;
      this.person = this.person6Img;
    }
  }

  async signUp() {
    await createUserWithEmailAndPassword(
      this.auth,
      this.registerForm.value.email,
      this.registerForm.value.password
    );
    await updateProfile(this.auth.currentUser, {
      displayName: this.registerForm.value.nameAndSurname,
      photoURL: this.imgUrl,
    });
    await this.createUserDetailsDoc();
    await this.createWelcomeMessage();
    await signOut(this.auth);
    this.animateAndGoBackToLogin();
  }

  async createUserDetailsDoc() {
    await setDoc(doc(db, 'users', this.auth.currentUser.uid), {
      name: this.auth.currentUser.displayName,
      email: this.auth.currentUser.email,
      imgUrl: this.auth.currentUser.photoURL,
      isOnline: false,
      id: this.auth.currentUser.uid,
    });
  }

  async createWelcomeMessage() {
    const welcomeMessage = new DirectMessage({
      yourMessage: false,
      createdBy: 'gZrReha096XBbzYewrjt1cP8AZB2a',
      creationDate: Date.now(),
      message:
        'Herzlich willkommen auf dem Code Learning Server 👋 ich hoffe, du hast hergefunden',
      imageUrl:
        'https://firebasestorage.googleapis.com/v0/b/da-bubble-87fea.appspot.com/o/userImages%2FwelcomeGif.gif?alt=media&token=91f0cf99-d5d8-47ad-be89-15ca36856c35',
    });
    const newUserRef = doc(
      db,
      `users/${this.auth.currentUser.uid}/allDirectMessages`,
      'gZrReha096XBbzYewrjt1cP8AZB2'
    );

    try {
      await setDoc(newUserRef, {}, { merge: true });

      const directMessagesCollection = collection(
        db,
        `users/${this.auth.currentUser.uid}/allDirectMessages/gZrReha096XBbzYewrjt1cP8AZB2/directMessages`
      );

      const docRefNewUser = await addDoc(
        directMessagesCollection,
        welcomeMessage.toJSON()
      );

      await updateDoc(
        doc(
          db,
          `users/${this.auth.currentUser.uid}/allDirectMessages/gZrReha096XBbzYewrjt1cP8AZB2/directMessages`,
          docRefNewUser.id
        ),
        {
          messageId: docRefNewUser.id,
        }
      );
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht: ', error);
    }
  }

  animateAndGoBackToLogin() {
    this.userCreationSuccess = true;
    setTimeout(() => {
      this.userCreationSuccess = false;
      this.goBackToLogin();
    }, 1500);
  }
}
