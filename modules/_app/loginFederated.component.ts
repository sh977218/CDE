import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';
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
                            federated: true,
                        };
                        if (window.location.href.indexOf('-green.') !== -1) {
                            body.green = true;
                        }
                        return http.post('/server/login', body, { withCredentials: true, responseType: 'text' });
                    } else {
                        return throwError(() => new Error('No ticket found.'));
                    }
                })
            )
            .subscribe({
                next: () => {
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
