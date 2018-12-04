import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, Injectable, Injector } from '@angular/core';
import { MatDialog } from '@angular/material';
import { PushNotificationSubscriptionService } from '_app/pushNotificationSubscriptionService';
import _noop from 'lodash/noop';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { EmptyObservable } from 'rxjs/observable/EmptyObservable';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { uriView } from 'shared/item';
import { Cb, CbErr, CbErrObj, Comment, User } from 'shared/models.model';
import { isOrgAdmin, isOrgCurator } from 'shared/system/authorizationShared';
import { newNotificationSettings, newNotificationSettingsMedia } from 'shared/user';

@Injectable()
export class UserService {
    private listeners: Cb[] = [];
    private mailSubscription: Subscription;
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
        this.reload();
        this.resetInactivityTimeout();
        document.body.addEventListener('click', () => this.resetInactivityTimeout());
    }

    catch(cb: CbErrObj<HttpErrorResponse>): Promise<any> {
        return this.promise.catch(cb);
    }

    clear() {
        this.user = undefined;
        this.userOrgs.length = 0;
        if (this.mailSubscription) this.mailSubscription.unsubscribe();
        this.mailSubscription = undefined;
    }

    static getEltLink(c: Comment) {
        return uriView(c.element!.eltType!, c.element!.eltId!);
    }

    loggedIn() {
        return !!this.user;
    }

    isOrgCurator () {
        return this.user && isOrgCurator(this.user);
    }

    reload(cb = _noop) {
        this.clear();
        this.promise = new Promise<User>((resolve, reject) => {
            this.http.get<User>('/server/user/').subscribe(response => {
                if (!response || !response.username) {
                    return reject();
                }
                this.user = UserService.validate(response);
                this.setOrganizations();
                this.mailSubscription = this.http.get<{ count: number }>('/server/user/mailStatus').subscribe(response => {
                    if (this.user) {
                        this.user.hasMail = response.count > 0;
                    }
                }, _noop);
                resolve(this.user);
            }, reject);
        });
        this.promise.finally(() => {
            this.listeners.forEach(listener => listener());
        });
        this.promise.then(user => PushNotificationSubscriptionService.subscriptionServerUpdate(user && user._id)).catch(_noop);
        this.promise.then(cb, cb);
    }

    setOrganizations() {
        if (this.user && this.user.orgAdmin) {
            this.userOrgs = this.user.orgAdmin.slice(0);
            this.user.orgCurator && this.user.orgCurator.forEach(c => {
                if (this.userOrgs.indexOf(c) < 0) this.userOrgs.push(c);
            });
        }
    }

    subscribe(cb: Cb) {
        this.listeners.push(cb);
    }

    resetInactivityTimeout () {
        clearTimeout(this.logoutTimeout);
        if (this.loggedIn()) {
            this.logoutTimeout = window.setTimeout(() => {
                if (this.loggedIn()) {
                    this.reload(() => {
                        if (!this.loggedIn()) {
                            this.dialog.open(InactivityLoggedOutComponent);
                        }
                    });
                }
            }, INACTIVE_TIMEOUT);
        }
    }

    then(cb: (user: User) => any, errorCb?: CbErr): Promise<any> {
        return this.promise.then(cb, errorCb);
    }

    static validate(user: User) {
        if (!user.orgAdmin) user.orgAdmin = [];
        if (!user.orgCurator) user.orgCurator = [];
        if (!user.notificationSettings) user.notificationSettings = newNotificationSettings();
        if (!user.notificationSettings.approvalComment) user.notificationSettings.approvalComment = newNotificationSettingsMedia();
        if (!user.notificationSettings.comment) user.notificationSettings.comment = newNotificationSettingsMedia();
        return user;
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