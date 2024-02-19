import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';


@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {

  first: boolean = false;
  second: boolean = true;
  
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
    console.log(this.registerForm.valid);
    this.first = false;
    this.second = true;
  }

  chooseAvatar( person: number ){
    if(person == 1){
      this.imgUrl = this.person1Img;
    } else if (person == 2) {
      this.imgUrl = this.person2Img;
    } else if (person == 3) {
      this.imgUrl = this.person3Img;
    } else if (person == 4) {
      this.imgUrl = this.person4Img;
    } else if (person == 5) {
      this.imgUrl = this.person5Img;
    } else if (person == 6) {
      this.imgUrl = this.person6Img;
    }
  }

  signUp() {

  }
}
