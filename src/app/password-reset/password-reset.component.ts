import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './password-reset.component.html',
  styleUrl: './password-reset.component.scss'
})
export class PasswordResetComponent {

  constructor(private router: Router, private fb: FormBuilder) { }

  first: boolean = true;
  emailSent: boolean = false;
  sendEmailBtnDisabled: boolean = false;

  emailForPasswordResetForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  })
  goBackToLogin() {
    this.router.navigateByUrl('login');
  }

  sendEmail(){
    this.sendEmailBtnDisabled = true;
    this.emailSent = true;
    setTimeout(() => {
      this.emailSent = false;
      this.sendEmailBtnDisabled = false;
    }, 800);

  }
}
