import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import _noop from 'lodash/noop';
import { Observable } from 'rxjs/Observable';
import { EmptyObservable } from 'rxjs/observable/EmptyObservable';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';

import { PushNotificationSubscriptionService } from '_app/pushNotificationSubscriptionService';
import { ITEM_MAP } from 'shared/item';
import { CbErr, Comment, User } from 'shared/models.model';
import { isOrgAdmin, isOrgCurator } from 'shared/system/authorizationShared';
import { LoginService } from '_app/login.service';

@Injectable()
export class UserService {
    private promise!: Promise<User>;
    searchTypeahead = ((text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term => term.length < 3 || !isOrgAdmin(this.user!) ? [] :
                this.http.get<User[]>('/server/user/searchUsers/' + term).pipe(
                    map(r => r.map(u => u.username),
                    catchError(() => EmptyObservable.create<string[]>())
                )
            )
        )));
    user?: User;
    userOrgs: string[] = [];
    logoutTimeout: number;

    constructor(
        private http: HttpClient,
        private loginSvc: LoginService
    ) {
        this.reload();
        document.body.addEventListener('click', () => this.resetInactivityTimeout());
    }

    catch(cb: CbErr): Promise<any> {
        return this.promise.catch(cb);
    }

    clear() {
        this.user = undefined;
        this.userOrgs.length = 0;
    }

    static getEltLink(c: Comment) {
        return ITEM_MAP[c.element!.eltType!].view + c.element!.eltId;
    }

    loggedIn() {
        return !!this.user;
    }

    isOrgCurator () {
        return this.user && isOrgCurator(this.user);
    }

    reload() {
        this.clear();
        this.promise = new Promise<User>((resolve, reject) => {
            this.http.get<User>('/server/user/').subscribe(response => {
                if (!response || !response.username) {
                    return reject();
                }
                this.user = response;
                if (!this.user.orgAdmin) this.user.orgAdmin = [];
                if (!this.user.orgCurator) this.user.orgCurator = [];
                this.setOrganizations();
                this.http.get<{count: number}>('/server/user/mailStatus').subscribe(response =>
                    this.user!.hasMail = response.count > 0);
                resolve(this.user);
            }, reject);
        });
        this.promise.then(user => PushNotificationSubscriptionService.subscriptionServerUpdate(user && user._id)).catch(_noop);
    }

    setOrganizations() {
        if (this.user && this.user.orgAdmin) {
            this.userOrgs = this.user.orgAdmin.slice(0);
            this.user.orgCurator && this.user.orgCurator.forEach(c => {
                if (this.userOrgs.indexOf(c) < 0) this.userOrgs.push(c);
            });
        }
    }

    resetInactivityTimeout () {
        clearTimeout(this.logoutTimeout);
        // @ts-ignore
        this.logoutTimeout = setTimeout(() => {
            this.loginSvc.goToLogin();
            // this.router.navigate(["/login"]);
            console.log("10 secs have elapsed");
        }, 10000);
        console.log(typeof this.logoutTimeout);
    }

    then(cb: (user: User) => any, errorCb?: CbErr): Promise<any> {
        return this.promise.then(cb, errorCb);
    }
}
