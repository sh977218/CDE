import { Component } from '@angular/core';
import { LoginService } from '_app/login.service';

@Component({
    selector: 'cde-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: true,
})
export class LoginComponent {
    constructor(public loginService: LoginService) {}
}
