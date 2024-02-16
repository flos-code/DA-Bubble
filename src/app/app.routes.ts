import { Routes } from '@angular/router';
import { ImprintComponent } from './imprint/imprint.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
{ path: 'imprint', component: ImprintComponent },
{ path: 'privacy-policy', component: PrivacyPolicyComponent },
{ path: 'login', component: LoginComponent}
];
