import { HttpClient } from '@angular/common/http';
import { Component, Injectable, Injector } from '@angular/core';
import { MatDialog } from '@angular/material';
import _noop from 'lodash/noop';
import { Observable } from 'rxjs/Observable';
import { EmptyObservable } from 'rxjs/observable/EmptyObservable';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';

import { NotificationService } from '_app/notifications/notification.service';
import { PushNotificationSubscriptionService } from '_app/pushNotificationSubscriptionService';
import { ITEM_MAP } from 'shared/item';
import { CbErr, Comment, NotificationSettings, NotificationTypesSettings, User } from 'shared/models.model';
import { isOrgAdmin, isOrgCurator } from 'shared/system/authorizationShared';

@Injectable()
export class UserService {
    private notificationService: any = {clear: _noop, reload: _noop};
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

    constructor(private dialog: MatDialog,
                private http: HttpClient,
                private injector: Injector) {
        if (APPLICATION_NAME === 'CDE Repository') {
            this.notificationService = <NotificationService>this.injector.get(NotificationService);
        }
        this.reload();
        this.resetInactivityTimeout();
        document.body.addEventListener('click', () => this.resetInactivityTimeout());
    }

    catch(cb: CbErr): Promise<any> {
        return this.promise.catch(cb);
    }

    clear() {
        this.user = undefined;
        this.userOrgs.length = 0;
        this.notificationService.clear();
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
                UserService.validate(this.user);
                this.setOrganizations();
                this.http.get<{count: number}>('/server/user/mailStatus').subscribe(response =>
                    this.user!.hasMail = response.count > 0, () => {});
                this.notificationService.reload();
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
        if (this.loggedIn()) {
            // @ts-ignore
            this.logoutTimeout = setTimeout(() => {
                if (this.loggedIn()) {
                    this.reload();
                    if (!this.loggedIn()) {
                        this.dialog.open(InactivityLoggedOutComponent);
                    }
                }
            }, (window as any).inactivityTimeout);
        }
    }

    then(cb: (user: User) => any, errorCb?: CbErr): Promise<any> {
        return this.promise.then(cb, errorCb);
    }

    static validate(user: User) {
        if (!user.orgAdmin) user.orgAdmin = [];
        if (!user.orgCurator) user.orgCurator = [];
        if (!user.notifications) user.notifications = new NotificationSettings();
        if (!user.notifications.approvalComment) user.notifications.approvalComment = new NotificationTypesSettings();
    }
}

@Component({
    template: `
        <h1 mat-dialog-title>Inactivity timeout</h1>
        <div mat-dialog-content>
            <p>Your session was automatically timed out. </p>
        </div>
        <div mat-dialog-actions>
            <button mat-raised-button [mat-dialog-close]="" class="float-right">OK</button>
        </div>
    `,
})
export class InactivityLoggedOutComponent {}