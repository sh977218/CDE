import { HttpClient } from '@angular/common/http';
import { forwardRef, Inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Subscription } from 'rxjs';
import { isEmpty } from 'lodash';
import { map } from 'rxjs/operators';

import { Cb1, User } from 'shared/models.model';
import { Organization } from 'shared/organization/organization';
import {
    isOrgCurator,
    isOrgAdmin,
    isOrgAuthority,
    hasRolePrivilege,
    isSiteAdmin,
    canViewComment,
    canEditArticle,
    isNlmCurator,
} from 'shared/security/authorizationShared';
import { newNotificationSettings, newNotificationSettingsMediaDrawer } from 'shared/user';
import { INACTIVE_TIMEOUT } from 'shared/constants';
import { NotificationService } from '_app/notifications/notification.service';
import { removeFromArray } from 'shared/array';
import { InactivityLoggedOutModalComponent } from '../inactivity-logged-out-modal/inactivity-logged-out-modal.component';

/*
 * 3 ways to get User:
 *     1. userService.user - synchronous, does not wait for login, used for change detection and code that has already waited
 *     2. userService.waitForUser - asynchronous Promise, one-time, used for completing actions, can get stale, logged out is rejected
 *     3. userService.subscribe - asynchronous custom Callback, always up-to-date, need to unsubscribe
 */
@Injectable()
export class UserService {
    private _user: User | undefined = undefined;

    private _user$ = new BehaviorSubject<User | undefined>(undefined);
    user$ = this._user$.pipe(
        map(user => {
            if (isEmpty(user)) return undefined;
            else return user;
        })
    );

    private listeners: Cb1<User | null>[] = [];
    private mailSubscription?: Subscription;
    userOrgs: string[] = [];
    logoutTimeout?: number;
    private promise!: Promise<User | undefined>;

    constructor(
        @Inject(forwardRef(() => NotificationService))
        private notificationService: NotificationService,
        @Inject(forwardRef(() => HttpClient)) private http: HttpClient,
        @Inject(forwardRef(() => MatDialog)) private dialog: MatDialog
    ) {
        this.reload();
        this.resetInactivityTimeout();
        document.body.addEventListener('click', () => this.resetInactivityTimeout());
    }

    clear() {
        this._user = undefined;
        this._user$.next(undefined);
        this.userOrgs.length = 0;
        if (this.mailSubscription) {
            this.mailSubscription.unsubscribe();
        }
        this.mailSubscription = undefined;
    }

    isOrgCurator = () => isOrgCurator(this.user);
    isOrgAdmin = () => isOrgAdmin(this.user);
    isOrgAuthority = () => isOrgAuthority(this.user);
    isNlmCurator = () => isNlmCurator(this.user);
    isSiteAdmin = () => isSiteAdmin(this.user);
    isDocumentEditor = () => canEditArticle(this.user);

    canSeeComment = () => canViewComment(this.user);
    canViewComment: boolean = false;

    loginViaJwt(jwt: string): Promise<User> {
        return this.http
            .post<User>('/server/user/jwt', { jwtToken: jwt })
            .toPromise()
            .then(user => this.processUser(user));
    }

    async processUser(user: User | undefined): Promise<User> {
        function isUser(user: User): user is User {
            return !!(user as User).username;
        }

        this._user$.next(user);

        if (!user || !isUser(user)) {
            this._user = undefined;
            return Promise.reject();
        }
        this._user = this.validate(user);
        await this.setOrganizations();
        if (this._user.searchSettings && !['summary', 'table'].includes(this._user.searchSettings.defaultSearchView)) {
            this._user.searchSettings.defaultSearchView = 'summary';
        }
        this.canViewComment = canViewComment(this.user);
        if (this.isSiteAdmin()) {
            this.notificationService.updateErrorNumber();
        }
        return user;
    }

    reload(): Promise<User | undefined> {
        return (this.promise = this.http
            .get<User>('/server/user/')
            .toPromise()
            .then(user => {
                return this.reloadFrom(user);
            }));
    }

    reloadFrom(user: User): Promise<User> {
        this.clear();
        const promise = Promise.resolve(user).then(user => this.processUser(user));
        promise.finally(() => {
            this.listeners.forEach(listener => listener(this._user || null));
        });
        return promise;
    }

    resetInactivityTimeout() {
        clearTimeout(this.logoutTimeout);
        if (this.user) {
            this.logoutTimeout = window.setTimeout(() => {
                if (this.user) {
                    this.reload();
                    this.waitForUser().then(() => {
                        if (!this.user) {
                            this.dialog.open(InactivityLoggedOutModalComponent);
                        }
                    });
                }
            }, INACTIVE_TIMEOUT);
        }
    }

    save(incrementalUpdate: Partial<User>) {
        return this.http.post<User>('/server/user/', incrementalUpdate);
    }

    searchUsernames(username: string) {
        return this.http.get<User[]>('/server/user/usernames/' + username);
    }

    setOrganizations(): Promise<void> {
        if (hasRolePrivilege(this.user, 'universalCreate')) {
            return this.http
                .get<Organization[]>('/server/orgManagement/managedOrgs')
                .toPromise()
                .then(orgs => {
                    this.userOrgs = orgs.map(org => org.name);
                });
        } else {
            this.userOrgs = Array.from(
                new Set(
                    new Array<string>().concat(
                        this.user && Array.isArray(this.user.orgAdmin) ? this.user.orgAdmin : [],
                        this.user && Array.isArray(this.user.orgCurator) ? this.user.orgCurator : [],
                        this.user && Array.isArray(this.user.orgEditor) ? this.user.orgEditor : []
                    )
                )
            );
            return Promise.resolve();
        }
    }

    subscribe(cb: Cb1<User | null>) {
        if (this._user !== undefined) {
            cb(this._user);
        }
        this.listeners.push(cb);
        return () => {
            removeFromArray(this.listeners, cb);
        };
    }

    get user(): User | undefined {
        return this._user || undefined;
    }

    waitForUser(): Promise<User | undefined> {
        return this.promise;
    }

    validate(user: User): User {
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
}
