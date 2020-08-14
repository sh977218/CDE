import { Component, forwardRef, Inject } from '@angular/core';
import { NotificationService } from '_app/notifications/notification.service';
import { interruptEvent } from 'non-core/browser';

@Component({
    selector: 'cde-notifications',
    templateUrl: './notificationDrawer.component.html',
})
export class NotificationDrawerComponent {
    interruptEvent = interruptEvent;

    constructor(
        @Inject(forwardRef(() => NotificationService)) public notificationService: NotificationService,
    ) {}
}
