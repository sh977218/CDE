import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import { Observable } from 'rxjs/Observable';

import { IsAllowedService } from 'core/isAllowed.service';
import { SharedService } from 'core/shared.service';


@Injectable()
export class UserService {
    private promise: Promise<void>;
    searchTypeahead = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term => term.length < 3 || !SharedService.auth.hasRole(this.user, 'OrgAuthority') ? [] :
                this.http.get<any>('/searchUsers/' + term).pipe(
                    map((r: any) => r.users.map(u => u.username)),
                    catchError(() => of([]))
                )
            )
        );
    user: any;
    userOrgs: any[] = [];

    constructor(
        private http: HttpClient,
    ) {
        this.reload();
    }

    static getEltLink(c) {
        return {
            cde: '/deView?tinyId=',
            form: '/formView?tinyId=',
            board: '/board/'
        }[c.element.eltType] + c.element.eltId;
    }

    reload () {
        this.promise = new Promise<void>(resolve => {
            this.http.get('/user/me').subscribe(response => {
                this.user = response;
                this.setOrganizations();
                this.http.get<any>('/mailStatus').subscribe(response => {
                    if (response.count > 0) this.user.hasMail = true;
                }, () => {});
                resolve();
            }, () => {});
        });
    }

    setOrganizations () {
        if (this.user.orgAdmin) {
            this.userOrgs = this.user.orgAdmin.slice(0);
            this.user.orgCurator.forEach(c => {
                if (this.userOrgs.indexOf(c) < 0)
                    this.userOrgs.push(c);
            });
        }
    }

    then (cb) {
        return this.promise.then(cb);
    }
}
