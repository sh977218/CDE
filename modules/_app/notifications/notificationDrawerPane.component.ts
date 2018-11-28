import { Component } from '@angular/core';
import { NotificationService } from '_app/notifications/notification.service';
import '_app/notifications/notificationDrawer.scss';

@Component({
    templateUrl: './notificationDrawerPane.component.html',
})
export class NotificationDrawerPaneComponent {
    constructor(public notificationService: NotificationService) {}
}
