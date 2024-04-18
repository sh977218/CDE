import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { switchMap, tap } from 'rxjs/operators';
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
                        return http.post<{ jwtToken: string }>('/server/login', body, { withCredentials: true }).pipe(
                            tap({
                                next: jwtToken => localStorage.setItem('jwtToken', jwtToken.jwtToken),
                                error: () => localStorage.removeItem('jwtToken'),
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
                    localStorage.removeItem('jwtToken'), this.alertService.addAlert('danger', `Error log`);
                    window?.opener?.loggedIn();
                },
            });
    }
}
