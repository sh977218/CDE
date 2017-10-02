import { Injectable } from '@angular/core';
import { Http } from "@angular/http";

@Injectable()
export class UserService {

    constructor(private http: Http) {
        this.reload();
    }

    private promise: Promise<void>;

    user: any;
    userOrgs: any[] = [];

    then (cb) {
        return this.promise.then(cb);
    }

    reload () {
        this.promise = new Promise<void>(resolve => {
            this.http.get('/user/me').map(r => r.json()).subscribe(response => {
                this.user = response;
                this.setOrganizations();
                this.http.get('/mailStatus').map(r => r.json()).subscribe(response => {
                    if (response.count > 0) this.user.hasMail = true;
                }, function () {
                });
                resolve();
            }, () => {});
        });
    }

    setOrganizations () {
        if (this.user.orgAdmin) {
            this.userOrgs = this.user.orgAdmin.slice(0);
            this.user.orgCurator.forEach(c => {
                if (this.userOrgs.indexOf(c) < 0) {
                    this.userOrgs.push(c);
                }
            });
        }
    };

}