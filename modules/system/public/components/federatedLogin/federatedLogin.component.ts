import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from '_app/login.service';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';

@Component({
    templateUrl: 'federatedLogin.component.html',
})
export class FederatedLoginComponent {

    showError: boolean;

    constructor(private route: ActivatedRoute,
                private http: HttpClient,
                private alert: AlertService,
                private loginSvc: LoginService,
                private userService: UserService,
                private router: Router) {

        this.route.queryParams.subscribe(async params => {
            const ticket = params.ticket;
            if (!ticket) {
                this.alert.addAlert('danger', 'Something went wrong: Missing ticket.');
                return;
            }
            const loginRes = await this.http.post('/server/system/login',
                {
                    ticket,
                    username: 'x', password: 'x',
                    federated: true}, {responseType: 'text'}).toPromise().catch(e => {});

            if (loginRes === 'OK') {
                this.userService.reload();
                if (this.loginSvc.getPreviousRoute()) {
                    this.router.navigate(
                        [this.loginSvc.getPreviousRoute().url],
                        {queryParams: this.loginSvc.getPreviousRoute().queryParams}
                    );
                } else {
                    this.router.navigate(['/home']);
                }
            } else {
                this.showError = true;
            }
        });
    }



}
