import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { initializeApp } from "firebase/app";
import { Router } from '@angular/router';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

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
  selector: 'app-password-reset',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './password-reset.component.html',
  styleUrl: './password-reset.component.scss'
})
export class PasswordResetComponent {

  constructor(private router: Router, private fb: FormBuilder) { }
  auth = getAuth(app);

  first: boolean = true;
  emailSent: boolean = false;
  sendEmailBtnDisabled: boolean = false;

  emailForPasswordResetForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  })
  goBackToLogin() {
    this.router.navigateByUrl('login');
  }

  async sendEmail() {

    sendPasswordResetEmail(this.auth, this.emailForPasswordResetForm.value.email)
      .then(() => {
        // Password reset email sent!
        // ..
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
      });
    this.sendEmailBtnDisabled = true;
    this.emailSent = true;
    setTimeout(() => {
      this.emailSent = false;
      this.sendEmailBtnDisabled = false;
    }, 800);

  }
}
