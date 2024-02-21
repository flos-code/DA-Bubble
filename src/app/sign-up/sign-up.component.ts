import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { getAuth, createUserWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";

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
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {

  auth = getAuth(app);

  first: boolean = true;
  second: boolean = false;
  person: string = 'zero';
  current: Date = new Date;
  uID: string = '';
  userCreationSuccess: boolean = false;

  genericImg: string = "/assets/img/login/profile_generic_big.png"
  person1Img: string = "/assets/img/userImages/userImage1.svg"
  person2Img: string = "/assets/img/userImages/userImage2.svg"
  person3Img: string = "/assets/img/userImages/userImage3.svg"
  person4Img: string = "/assets/img/userImages/userImage4.svg"
  person5Img: string = "/assets/img/userImages/userImage5.svg"
  person6Img: string = "/assets/img/userImages/userImage6.svg"
  imgUrl: string = this.genericImg;

  registerForm = this.fb.group({
    nameAndSurname: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    checkbox: [false, Validators.requiredTrue],
  });

  constructor(private router: Router, private fb: FormBuilder) { }

  goBackToLogin() {
    this.router.navigateByUrl('login');
  }

  goBackToFirst() {
    this.first = true;
    this.second = false;
  }

  getNotesRef() {
    return collection(db, "users")
  }

  goToAvatarChoice() {
    this.first = false;
    this.second = true;
  }

  chooseAvatar(person: number) {
    if (person == 1) {
      this.imgUrl = this.person1Img;
      this.person = 'one';
    } else if (person == 2) {
      this.imgUrl = this.person2Img;
      this.person = 'two';
    } else if (person == 3) {
      this.imgUrl = this.person3Img;
      this.person = 'three'
    } else if (person == 4) {
      this.imgUrl = this.person4Img;
      this.person = 'four'
    } else if (person == 5) {
      this.imgUrl = this.person5Img;
      this.person = 'five'
    } else if (person == 6) {
      this.imgUrl = this.person6Img;
      this.person = 'six'
    }
  }

  async signUp() {
    await createUserWithEmailAndPassword(this.auth, this.registerForm.value.email, this.registerForm.value.password);
    await updateProfile(this.auth.currentUser, {
      displayName: this.registerForm.value.nameAndSurname, 
      photoURL: this.person,
    });
    await this.createUserDetailsDoc();
    await this.createDirectMessagesCollection();
    await signOut(this.auth);
    this.animateAndGoBackToLogin();
  }

  async createUserDetailsDoc() {
    await setDoc(doc(db, "users", this.auth.currentUser.uid), {
      name: this.auth.currentUser.displayName,
      email: this.auth.currentUser.email,
      imgUrl: this.auth.currentUser.photoURL,
      isOnline: false,
      id: this.auth.currentUser.uid,
    });
  }

  async createDirectMessagesCollection() {
    await setDoc(doc(db, "users", this.auth.currentUser.uid, 'direct_messages', 'dummy_message'), {
      message: 'Lorem ipsum, bla bla bla',
      from: this.auth.currentUser.uid,
      to: 'receive_from_html',
      reactions: ':rocket',
      timestamp: this.current.getTime(),
    });
  }

  animateAndGoBackToLogin(){
    this.userCreationSuccess = true;
    setTimeout(() => {
      this.goBackToLogin();
      this.userCreationSuccess = false;
    }, 1500);
  }

}
