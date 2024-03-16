import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { RouterModule } from '@angular/router';

const firebaseConfig = {
  apiKey: "AIzaSyC520Za3P8qTUGvWM0KxuYqGIMaz-Vd48k",
  authDomain: "da-bubble-87fea.firebaseapp.com",
  projectId: "da-bubble-87fea",
  storageBucket: "da-bubble-87fea.appspot.com",
  messagingSenderId: "970901942782",
  appId: "1:970901942782:web:56b67253649b6206f290af"
};

const provider = new GoogleAuthProvider();
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss', 'login.component.animations.scss']
})

export class LoginComponent implements OnInit {
  auth = getAuth(app);

  startTextAnimation: boolean = false;
  removeDNone: boolean = false;
  removeAnimatedContainer: boolean = false;
  startLogoAnimation: boolean = false;
  removeMainDiv: boolean = false;

  signInForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  })
  constructor(private fb: FormBuilder, private router: Router) { }

  ngOnInit(): void {
    this.startTheAnimation();
  }

  startTheAnimation() {
    setTimeout(() => {
      this.startLogoAnimation = true;
    }, 1375);
    setTimeout(() => {
      this.removeDNone = true;
    }, 1500);
    setTimeout(() => {
      this.startTextAnimation = true;
    }, 1500);
    setTimeout(() => {
      this.removeAnimatedContainer = true;
    }, 3100);
  }

  async signInWithGoogle() {
    await signInWithPopup(this.auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        // const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        console.log(user);
        // IdP data available using getAdditionalUserInfo(result)
        // ...
      }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  }

  async signIn() {
    await signInWithEmailAndPassword(this.auth, this.signInForm.value.email, this.signInForm.value.password);
    let userRef = doc(db, "users", this.auth.currentUser.uid)
    await updateDoc(userRef, {
      isOnline: true,
    });
    this.router.navigateByUrl('');
  }

  async signInAsGuest() {
    await signInWithEmailAndPassword(this.auth, 'guest@dabubble77.com', '123456');
    this.router.navigateByUrl('');
  }

  goToPasswordReset() {
    this.router.navigateByUrl('/reset_password')
  }

}
