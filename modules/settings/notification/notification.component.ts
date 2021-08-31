import { Component } from '@angular/core';
import { PushNotificationSubscriptionService } from '_app/pushNotificationSubscriptionService';
import { UserService } from '_app/user.service';
import * as _noop from 'lodash/noop';
import { User } from 'shared/models.model';
import { hasRole, isSiteAdmin } from 'shared/security/authorizationShared';

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
    clientStatus = PushNotificationSubscriptionService.subscriptionCheckClient;
    hasRole = hasRole;
    isSiteAdmin = isSiteAdmin;
    readonly booleanSettingOptions = ['Disabled', 'Enabled'];

    constructor(
        public userService: UserService
    ) {
        this.userService.reload();
    }

    pushSubscribe(user: User) {
        PushNotificationSubscriptionService.subscriptionNew(user._id).catch(_noop);
    }

    pushUnsubscribe(user: User) {
        PushNotificationSubscriptionService.subscriptionDelete(user._id).catch(_noop);
    }

    get user(): User | undefined {
        return this.userService.user;
    }
}
