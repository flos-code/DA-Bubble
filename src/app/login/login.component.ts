import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  constructor() { }



  validateEmail() {
    let mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    let inputValue = (<HTMLInputElement>document.getElementById('login_email')).value;
    if (inputValue.match(mailformat)) {
      return true;
    }
    else {
      return false;
    }
  }
}
