import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { initializeApp } from "firebase/app";
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

  goToAvatarChoice() {
    console.log(this.registerForm.valid, this.registerForm.value.nameAndSurname, this.registerForm.value.email, this.registerForm.value.password);
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
    console.log(this.registerForm.value.nameAndSurname, this.registerForm.value.email, this.registerForm.value.password, this.person);
    let email = this.registerForm.value.email;
    let password = this.registerForm.value.password;
    let name = this.registerForm.value.nameAndSurname;
    await createUserWithEmailAndPassword(this.auth, email, password);
    await updateProfile(this.auth.currentUser, {
      displayName: name, photoURL: this.person,
    });
    console.log(this.auth.currentUser);
    await signOut(this.auth);
  }
}
