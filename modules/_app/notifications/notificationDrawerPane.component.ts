import { Component } from '@angular/core';
import { NotificationService } from '_app/notifications/notification.service';
import '_app/notifications/notificationDrawer.scss';
import { interruptEvent } from 'non-core/browser';

@Component({
    templateUrl: './notificationDrawerPane.component.html',
})
export class NotificationDrawerPaneComponent {
    interruptEvent = interruptEvent;

    constructor(public notificationService: NotificationService) {}
}
