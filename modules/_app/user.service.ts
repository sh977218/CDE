import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, Injectable } from '@angular/core';
import { PushNotificationSubscriptionService } from '_app/pushNotificationSubscriptionService';
import _noop from 'lodash/noop';
import { Subscription } from 'rxjs';
import { uriView } from 'shared/item';
import { Cb, CbErr, CbErrorObj, Comment, User } from 'shared/models.model';
import { hasRole, isOrgCurator, isOrgAdmin, isOrgAuthority } from 'shared/system/authorizationShared';
import { newNotificationSettings, newNotificationSettingsMediaDrawer } from 'shared/user';
import { MatDialog } from '@angular/material/dialog';

@Injectable()
export class UserService {
    private listeners: Cb[] = [];
    private mailSubscription?: Subscription;
    private promise!: Promise<User>;
    user?: User;
    userOrgs: string[] = [];
    logoutTimeout?: number;

    constructor(private dialog: MatDialog,
                private http: HttpClient) {
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
        this.user = undefined;
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
                    return reject();
                }
                this.user = UserService.validate(response);
                this.setOrganizations();
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
            if (this.user.orgCurator) {
                this.user.orgCurator.forEach(c => {
                    if (this.userOrgs.indexOf(c) < 0) {
                        this.userOrgs.push(c);
                    }
                });
            }
        }
    }

    subscribe(cb: Cb) {
        this.listeners.push(cb);
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

    static validate(user: User) {
        if (!user.orgAdmin) {
            user.orgAdmin = [];
        }
        if (!user.orgCurator) {
            user.orgCurator = [];
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
            <button mat-raised-button [mat-dialog-close]="" class="float-right">OK</button>
        </div>
    `,
})
export class InactivityLoggedOutComponent {
}
