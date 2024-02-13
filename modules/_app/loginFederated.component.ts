import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { isEmpty } from 'lodash';
import { AlertService } from '../alert/alert.service';

@Component({
    template: ``,
    standalone: true,
})
export class LoginFederatedComponent {
    constructor(
        public http: HttpClient,
        public activatedRoute: ActivatedRoute,
        public router: Router,
        public alertService: AlertService
    ) {
        activatedRoute.queryParamMap
            .pipe(
                switchMap(qp => {
                    const ticket = qp.get('ticket');
                    if (ticket) {
                        const body: any = {
                            ticket,
                            username: 'x',
                            password: 'x',
                            federated: true,
                        };
                        if (window.location.href.indexOf('-green.') !== -1) {
                            body.green = true;
                        }
                        return http
                            .post('/server/system/login', body, {
                                withCredentials: true,
                                responseType: 'text',
                            })
                            .pipe(
                                map(user => {
                                    if (!isEmpty(user)) {
                                        return true;
                                    } else {
                                        return throwError(() => new Error('No user found.'));
                                    }
                                })
                            );
                    } else {
                        return throwError(() => new Error('No ticket found.'));
                    }
                })
            )
            .subscribe({
                next: url => {
                    this.alertService.addAlert('success', `Success logged in.`);
                    window?.opener?.loggedIn();
                    window.close();
                },
                error: e => {
                    this.alertService.addAlert('danger', `Error log`);
                    window?.opener?.loggedIn();
                },
            });
    }
}
