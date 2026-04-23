import { Component, OnInit } from '@angular/core';
import { AuthGoogle } from '../../servicios/auth-google';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  constructor(private authGoogle: AuthGoogle) {}

  ngOnInit() {
    this.authGoogle.inicializarLoginGmail();
  }

  login() {
    this.authGoogle.login();
  }
}
