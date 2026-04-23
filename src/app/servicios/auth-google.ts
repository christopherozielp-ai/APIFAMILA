import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

@Injectable({
  providedIn: 'root',
})
export class AuthGoogle {
  private initialized = false;

  constructor(private oauthService: OAuthService) {}

  inicializarLoginGmail() {
    if (this.initialized || typeof window === 'undefined') {
      return;
    }

    const config: any = {
      issuer: 'https://accounts.google.com',
      strictDiscoveryDocumentValidation: false,
      clientId: '714062156188-ntovmdcb11g76hh1kacpbu6m89cec64d.apps.googleusercontent.com',
      redirectUri: window.location.origin + '/main',
      scope: 'openid profile email'
    };
    this.oauthService.configure(config);
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
    this.oauthService.setupAutomaticSilentRefresh();
    this.initialized = true;
  }
  login() {
    this.oauthService.initLoginFlow();
  }
  logout() {
    this.oauthService.logOut();
  }
  getperfil(){
    return this.oauthService.getIdentityClaims();
  }
}


