import { Component } from '@angular/core';
import { getStatus, subscribe, unsubscribe } from '_app/pushNotificationSubscriptionService';
import { UserService } from '_app/user.service';
import { User } from 'shared/models.model';
import { hasRole, isSiteAdmin } from 'shared/security/authorizationShared';
import { noop } from 'shared/util';

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

    constructor(
        public userService: UserService
    ) {
        this.userService.reload();
    }

    clientStatus() {
        return getStatus(this.user?._id);
    }

    pushSubscribe(user: User) {
        subscribe(user._id).catch(noop);
    }

    pushUnsubscribe(user: User) {
        unsubscribe(user._id).catch(noop);
    }

    get user(): User | undefined {
        return this.userService.user;
    }
}
