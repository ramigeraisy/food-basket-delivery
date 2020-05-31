import { Component, OnInit } from '@angular/core';


import { DialogService } from '../../select-popup/dialog';
import { AuthService } from '../../auth/auth-service';
import { Router, Route, RouteReuseStrategy } from '@angular/router';
import { ApplicationSettings } from '../../manage/ApplicationSettings';

import { Context, RouteHelperService, NotSignedInGuard } from '@remult/core';
import { RegisterComponent } from '../register/register.component';
import { AdminGuard } from '../../auth/roles';
import { Sites } from '../../sites/sites';
import { CustomReuseStrategy } from 'src/app/custom-reuse-controller-router-strategy';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  static route: Route = { path: 'login', component: LoginComponent,canActivate:[NotSignedInGuard], data: { name: 'כניסה' } };
  constructor(
    private dialog: DialogService,
    private auth: AuthService,
    private router: RouteHelperService,
    private context: Context,
    private routeReuseStrategy:RouteReuseStrategy,
    public settings:ApplicationSettings
  ) { }
  isguest = Sites.getOrganizationFromContext(this.context) == Sites.guestSchema;
  user: string;
  password: string;
  remember: boolean;
  ngOnInit() {
  }
  getLogo() {
    return ApplicationSettings.get(this.context).logoUrl.value;
  }
  login() {
    this.auth.login(this.user, this.password, this.remember, () => this.password = '');
  }
  register() {
    this.router.navigateToComponent(RegisterComponent);
  }
  orgName() {
    return ApplicationSettings.get(this.context).organisationName.value;
  }
}
