import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import _noop from 'lodash/noop';
import { PushNotificationSubscriptionService } from '_app/pushNotificationSubscriptionService';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import { User } from 'shared/models.model';
import { hasRole, isSiteAdmin } from 'shared/system/authorizationShared';

@Component({
    selector: 'cde-notification',
    templateUrl: 'notification.component.html',
    styles: [`
        .disabled {
            color: darkgray;
        }

        .infoIcon {
            font-size: 1rem;
            margin-left: 5px;
            padding-top: 5px
        }
    `]
})
export class NotificationComponent {
    hasRole = hasRole;
    isSiteAdmin = isSiteAdmin;
    readonly booleanSettingOptions = ['Disabled', 'Enabled'];
    subscriptionStatusClient = PushNotificationSubscriptionService.subscriptionCheckClient;
    subscriptionStatusServer?: string;
    user!: User;

    constructor(private alert: AlertService,
                private http: HttpClient,
                public userService: UserService) {
        this.reloadUser();
    }

    checkSubscriptionServerStatus() {
        this.checkSubscriptionServerStatusEndpoint().then(
            () => {
                PushNotificationSubscriptionService.lastUser = this.user._id;
                this.subscriptionStatusServer = 'Subscribed';
            },
            err => {
                this.subscriptionStatusServer = (err !== 'Network Error' ? 'Not Subscribed' : 'Network Error');
            }
        );
    }

    checkSubscriptionServerStatusEndpoint(): Promise<void> {
        if (PushNotificationSubscriptionService.lastEndpoint) {
            return PushNotificationSubscriptionService.subscriptionServerUpdate(this.user._id)
                .catch(() => {
                    PushNotificationSubscriptionService.lastEndpoint = '';
                    return this.checkSubscriptionServerStatusNoEndpoint();
                });
        } else {
            return this.checkSubscriptionServerStatusNoEndpoint();
        }
    }

    checkSubscriptionServerStatusNoEndpoint(): Promise<void> {
        return PushNotificationSubscriptionService.getEndpoint().then(() => {
            return PushNotificationSubscriptionService.subscriptionServerUpdate(this.user._id);
        });
    }

    pushSubscribe() {
        PushNotificationSubscriptionService.subscriptionNew(this.user._id).then(() => {
            this.subscriptionStatusServer = 'Subscribed';
        }, _noop);
    }

    pushUnsubscribe() {
        PushNotificationSubscriptionService.subscriptionDelete(this.user._id).then(() => {
            this.subscriptionStatusServer = 'Not Subscribed';
        });
    }

    reloadUser() {
        this.userService.reload();
        this.userService.then(user => {
            this.user = user;
        }, _noop);
    }

    saveProfile() {
        this.http.post('/server/user/', this.user).subscribe(
            () => {
                this.reloadUser();
                this.alert.addAlert('success', 'Saved');
            }, () => this.alert.addAlert('danger', 'Error, unable to save')
        );
    }

}
