import { Component, forwardRef, Inject } from '@angular/core';
import { NotificationService } from '../notification.service';
import { Router } from '@angular/router';

@Component({
    selector: 'notification-dialog',
    templateUrl: 'notification-dialog.component.html',
    styleUrls: ['notification-dialog.component.scss'],
})
export class NotificationDialogComponent {
    constructor(
        @Inject(forwardRef(() => NotificationService)) public notificationSvc: NotificationService,
        @Inject(forwardRef(() => Router)) public router: Router
    ) {}

    goToServerError() {
        this.router.navigate(['siteAudit'], { queryParams: { tab: 'serverErrors' } });
        this.notificationSvc.show = false;
    }

    goToClientError() {
        this.router.navigate(['siteAudit'], { queryParams: { tab: 'clientErrors' } });
        this.notificationSvc.show = false;
    }
}
