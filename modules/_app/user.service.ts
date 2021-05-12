import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, forwardRef, Inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PushNotificationSubscriptionService } from '_app/pushNotificationSubscriptionService';
import { AlertService } from 'alert/alert.service';
import * as _noop from 'lodash/noop';
import { Subscription } from 'rxjs';
import { uriView } from 'shared/item';
import { Cb1, CbErr, CbErrorObj, Comment, User } from 'shared/models.model';
import { hasRole, isOrgCurator, isOrgAdmin, isOrgAuthority, hasRolePrivilege } from 'shared/system/authorizationShared';
import { Organization } from 'shared/system/organization';
import { newNotificationSettings, newNotificationSettingsMediaDrawer } from 'shared/user';

@Injectable()
export class UserService {
    private _user?: User | null;
    private listeners: Cb1<User | null>[] = [];
    private mailSubscription?: Subscription;
    private promise!: Promise<User>;
    userOrgs: string[] = [];
    logoutTimeout?: number;

    constructor(
        @Inject(forwardRef(() => AlertService)) private alert: AlertService,
        @Inject(forwardRef(() => HttpClient)) private http: HttpClient,
        @Inject(forwardRef(() => MatDialog)) private dialog: MatDialog,
    ) {
        this.reload();
        this.resetInactivityTimeout();
        document.body.addEventListener('click', () => this.resetInactivityTimeout());
    }

    searchUsernames(username: string) {
        return this.http.get<User[]>('/server/user/usernames/' + username);
    }

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

    loggedIn(): User | undefined {
        return this.user;
    }

    isOrgCurator = () => isOrgCurator(this.user);
    isOrgAdmin = () => isOrgAdmin(this.user);
    isOrgAuthority = () => isOrgAuthority(this.user);

    reload(cb = _noop) {
        this.clear();
        this.promise = new Promise<User>((resolve, reject) => {
            this.http.get<User>('/server/user/').subscribe(response => {
                if (!response || !response.username) {
                    this._user = null;
                    return reject();
                }
                this._user = UserService.validate(response);
                this.setOrganizations();
                if (this._user.searchSettings && !['summary', 'table'].includes(this._user.searchSettings.defaultSearchView)) {
                    this._user.searchSettings.defaultSearchView = 'summary';
                }
                resolve(this._user);
            }, reject);
        });
        this.promise.finally(() => {
            this.listeners.forEach(listener => listener(this._user || null));
        });
        this.promise.then(user => PushNotificationSubscriptionService.subscriptionServerUpdate(user && user._id)).catch(_noop);
        this.promise.then(cb, cb);
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

    then(cb: (user: User) => any, errorCb?: CbErr): Promise<any> {
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
        if (!user.notificationSettings.approvalAttachment && hasRole(user, 'AttachmentReviewer')) {
            user.notificationSettings.approvalAttachment = newNotificationSettingsMediaDrawer();
        }
        if (!user.notificationSettings.approvalComment && hasRole(user, 'CommentReviewer')) {
            user.notificationSettings.approvalComment = newNotificationSettingsMediaDrawer();
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
        <div mat-dialog-content>
            <p>Your session was automatically timed out. </p>
        </div>
        <div mat-dialog-actions>
            <button mat-raised-button [mat-dialog-close]="" class="float-right" color="primary">OK</button>
        </div>
    `,
})
export class InactivityLoggedOutComponent {
}
