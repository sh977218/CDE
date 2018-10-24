import { Component } from '@angular/core';

import './notificationDrawer.scss';
import { NotificationService } from '_app/notifications/notification.service';

@Component({
    templateUrl: './notificationDrawerPane.component.html',
})
export class NotificationDrawerPaneComponent {
    constructor(public notificationService: NotificationService) {}
}
