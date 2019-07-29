import { Component } from '@angular/core';
import { NotificationService } from '_app/notifications/notification.service';
import { interruptEvent } from 'non-core/browser';

@Component({
    selector: 'cde-notifications',
    templateUrl: './notificationDrawer.component.html',
})
export class NotificationDrawerComponent {
    interruptEvent = interruptEvent;

    constructor(public notificationService: NotificationService) {}
}
