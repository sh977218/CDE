import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, forwardRef, Inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { signInOut } from '_app/pushNotificationSubscriptionService';
import { AlertService } from 'alert/alert.service';
import { Subscription } from 'rxjs';
import { uriView } from 'shared/item';
import { Cb1, CbErrorObj, Comment, User } from 'shared/models.model';
import { Organization } from 'shared/organization/organization';
import {
    isOrgCurator, isOrgAdmin, isOrgAuthority, hasRolePrivilege, isSiteAdmin, canViewComment
} from 'shared/security/authorizationShared';
import { newNotificationSettings, newNotificationSettingsMediaDrawer } from 'shared/user';
import { noop } from 'shared/util';
import { NotificationService } from '_app/notifications/notification.service';

@Injectable()
export class UserService {
    private _user?: User | null;
    private listeners: Cb1<User | null>[] = [];
    private mailSubscription?: Subscription;
    private promise!: Promise<User>;
    userOrgs: string[] = [];
    canViewComment: boolean = false;
    logoutTimeout?: number;

    constructor(
        @Inject(forwardRef(() => AlertService)) private alert: AlertService,
        @Inject(forwardRef(() => NotificationService)) private notificationService: NotificationService,
        @Inject(forwardRef(() => HttpClient)) private http: HttpClient,
        @Inject(forwardRef(() => MatDialog)) private dialog: MatDialog,
    ) {
        this.reload();
        this.resetInactivityTimeout();
        document.body.addEventListener('click', () => this.resetInactivityTimeout());
    }

    canSeeComment = () => canViewComment(this.user);

    catch(cb: CbErrorObj<HttpErrorResponse>): Promise<any> {
        return this.promise.catch(cb);
    }

    clear() {
        this._user = undefined;
        this.userOrgs.length = 0;
        if (this.mailSubscription) {
            this.mailSubscription.unsubscribe();
        }
        this.mailSubscription = undefined;
    }

    isOrgCurator = () => isOrgCurator(this.user);
    isOrgAdmin = () => isOrgAdmin(this.user);
    isOrgAuthority = () => isOrgAuthority(this.user);
    isSiteAdmin = () => isSiteAdmin(this.user);

    loggedIn(): User | undefined {
        return this.user;
    }

    loginViaJwt(jwt: string): Promise<User> {
        return this.http.post<User>('/server/user/jwt', {jwtToken: jwt}).toPromise()
            .then(user => this.processUser(user));
    }

    processUser(user: User): Promise<User> {
        if (!user || !user.username) {
            this._user = null;
            return Promise.reject();
        }
        this._user = UserService.validate(user);
        this.setOrganizations();
        if (this._user.searchSettings && !['summary', 'table'].includes(this._user.searchSettings.defaultSearchView)) {
            this._user.searchSettings.defaultSearchView = 'summary';
        }
        this.canViewComment = canViewComment(this.user);
        if (this.isSiteAdmin()) {
            this.notificationService.updateErrorNumber();
        }
        return Promise.resolve(user);
    }

    reload(cb = noop) {
        this.clear();
        this.promise = this.http.get<User>('/server/user/').toPromise()
            .then(user => this.processUser(user));
        this.promise.finally(() => {
            this.listeners.forEach(listener => listener(this._user || null));
        });
        this.promise.then(user => signInOut(user && user._id)).catch(noop);
        this.promise.then(cb, cb);
    }

    resetInactivityTimeout() {
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

    save() {
        this.http.post('/server/user/', this.user).subscribe(
            () => {
                this.reload();
                this.alert.addAlert('success', 'Saved');
            },
            (err) => this.alert.httpErrorMessageAlert(err)
        );
    }

    searchUsernames(username: string) {
        return this.http.get<User[]>('/server/user/usernames/' + username);
    }

    setOrganizations() {
        if (hasRolePrivilege(this.user, 'universalCreate')) {
            this.http.get<Organization[]>('/server/orgManagement/managedOrgs')
                .subscribe(orgs => {
                    this.userOrgs = orgs.map(org => org.name);
                });
        } else {
            this.userOrgs = Array.from(new Set(new Array<string>().concat(
                this.user && Array.isArray(this.user.orgAdmin) ? this.user.orgAdmin : [],
                this.user && Array.isArray(this.user.orgCurator) ? this.user.orgCurator : [],
                this.user && Array.isArray(this.user.orgEditor) ? this.user.orgEditor : []
            )));
        }
    }

    subscribe(cb: Cb1<User | null>) {
        if (this._user !== undefined) {
            cb(this._user);
        }
        this.listeners.push(cb);
        return () => {
            const i = this.listeners.indexOf(cb);
            if (i > -1) {
                this.listeners.splice(i, 1);
            }
        };
    }

    then<T>(cb: (user: User) => T | Promise<T>, errorCb?: (err?: string) => T): Promise<T> {
        return this.promise.then(cb, errorCb);
    }

    get user(): User | undefined {
        return this._user || undefined;
    }

    static validate(user: User): User {
        if (!user.orgAdmin) {
            user.orgAdmin = [];
        }
        if (!user.orgCurator) {
            user.orgCurator = [];
        }
        if (!user.orgEditor) {
            user.orgEditor = [];
        }
        if (!user.notificationSettings) {
            user.notificationSettings = newNotificationSettings();
        }
        if (!user.notificationSettings.comment) {
            user.notificationSettings.comment = newNotificationSettingsMediaDrawer();
        }
        return user;
    }

    static getEltLink(c: Comment) {
        return uriView(c.element.eltType, c.element.eltId);
    }
}

@Component({
    template: `
        <h1 mat-dialog-title>Inactivity timeout</h1>
        <mat-dialog-content>
            <p>Your session was automatically timed out. </p>
        </mat-dialog-content>
        <mat-dialog-actions>
            <button class="button secondary" [mat-dialog-close]="">OK</button>
        </mat-dialog-actions>
    `,
})
export class InactivityLoggedOutComponent {
}
