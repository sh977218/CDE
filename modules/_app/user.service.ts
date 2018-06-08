import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import _noop from 'lodash/noop';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';

import { PushNotificationSubscriptionService } from '_app/pushNotificationSubscriptionService';
import { ITEM_MAP } from 'shared/item';
import { User } from 'shared/models.model';
import { isOrgAdmin, isOrgCurator } from 'shared/system/authorizationShared';

@Injectable()
export class UserService {
    private promise: Promise<User>;
    searchTypeahead = ((text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term => term.length < 3 || !isOrgAdmin(this.user) ? [] :
                this.http.get<any>('/searchUsers/' + term).pipe(
                    map((r: any) => r.users.map(u => u.username)),
                    catchError(() => of([]))
                )
            )
        ));
    user: User;
    userOrgs: string[] = [];

    constructor(
        private http: HttpClient,
    ) {
        this.reload();
    }

    catch(cb): Promise<User> {
        return this.promise.catch(cb);
    }

    clear() {
        this.user = null;
        this.userOrgs.length = 0;
    }

    static getEltLink(c) {
        return ITEM_MAP[c.element.eltType].view + c.element.eltId;
    }

    loggedIn() {
        return !!this.user;
    }

    isOrgCurator () {
        return isOrgCurator(this.user);
    }

    reload() {
        this.clear();
        this.promise = new Promise<User>((resolve, reject) => {
            this.http.get<User>('/server/user/').subscribe(response => {
                if (!response || !response.username) {
                    return reject();
                }
                this.user = response;
                this.setOrganizations();
                this.http.get<any>('/server/user/mailStatus').subscribe(response => this.user.hasMail = response.count > 0);
                resolve(this.user);
            }, reject);
        });
        this.promise.then(user => PushNotificationSubscriptionService.subscriptionServerUpdate(user && user._id)).catch(_noop);
    }

    setOrganizations() {
        if (this.user.orgAdmin) {
            this.userOrgs = this.user.orgAdmin.slice(0);
            this.user.orgCurator.forEach(c => {
                if (this.userOrgs.indexOf(c) < 0) this.userOrgs.push(c);
            });
        }
    }

    then(cb, errorCb = undefined): Promise<any> {
        return this.promise.then(cb, errorCb);
    }
}
