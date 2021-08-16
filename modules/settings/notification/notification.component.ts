import { Component } from '@angular/core';
import { PushNotificationSubscriptionService } from '_app/pushNotificationSubscriptionService';
import { UserService } from '_app/user.service';
import * as _noop from 'lodash/noop';
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

    constructor(
        public userService: UserService
    ) {
        this.userService.reload();
    }

    checkSubscriptionServerStatus(user: User) {
        this.checkSubscriptionServerStatusEndpoint(user).then(
            () => {
                PushNotificationSubscriptionService.lastUser = user._id;
                this.subscriptionStatusServer = 'Subscribed';
            },
            err => {
                this.subscriptionStatusServer = (err !== 'Network Error' ? 'Not Subscribed' : 'Network Error');
            }
        );
    }

    private checkSubscriptionServerStatusEndpoint(user: User): Promise<void> {
        if (PushNotificationSubscriptionService.lastEndpoint) {
            return PushNotificationSubscriptionService.subscriptionServerUpdate(user._id)
                .catch(() => {
                    PushNotificationSubscriptionService.lastEndpoint = '';
                    return this.checkSubscriptionServerStatusNoEndpoint(user);
                });
        } else {
            return this.checkSubscriptionServerStatusNoEndpoint(user);
        }
    }

    checkSubscriptionServerStatusNoEndpoint(user: User): Promise<void> {
        return PushNotificationSubscriptionService.getEndpoint().then(() => {
            return PushNotificationSubscriptionService.subscriptionServerUpdate(user._id);
        });
    }

    pushSubscribe(user: User) {
        PushNotificationSubscriptionService.subscriptionNew(user._id).then(() => {
            this.subscriptionStatusServer = 'Subscribed';
        }, _noop);
    }

    pushUnsubscribe(user: User) {
        PushNotificationSubscriptionService.subscriptionDelete(user._id).then(() => {
            this.subscriptionStatusServer = 'Not Subscribed';
        });
    }

    get user(): User | undefined {
        return this.userService.user;
    }
}
