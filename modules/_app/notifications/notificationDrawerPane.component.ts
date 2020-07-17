import { Component, forwardRef, Inject } from '@angular/core';
import { NotificationService } from '_app/notifications/notification.service';
import { interruptEvent } from 'non-core/browser';

@Component({
    templateUrl: './notificationDrawerPane.component.html',
    styleUrls: ['./notificationDrawer.style.scss'],
})
export class NotificationDrawerPaneComponent {
    interruptEvent = interruptEvent;

    constructor(
        @Inject(forwardRef(() => NotificationService)) public notificationService: NotificationService,
    ) {}
}
