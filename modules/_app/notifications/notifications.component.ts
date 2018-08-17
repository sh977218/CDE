import { Component } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AlertService } from '_app/alert.service';
import { UserService } from '_app/user.service';
import { isSiteAdmin } from 'shared/system/authorizationShared';

@Component({
    selector: 'cde-notifications',
    templateUrl: 'notifications.component.html',
    styles: [`
        #notificationBellIcon {
            font-size: 1.3em;
            margin-top: 10px
        }

        .notifMenu {
            width: 200px;
        }

        .mat-menu-item {
            line-height: 11px;
        }
    `]
})
export class NotificationsComponent {
    currentVersion = (window as any).version;
    numberVersionError = 0;
    numberServerError = 0;
    numberClientError = 0;
    numberError;

    constructor(private http: HttpClient,
                private userService: UserService,
                private alert: AlertService) {
        setInterval(async () => {
            try {
                const latestVersion = await this.http.get("/site-version", {responseType: 'text'}).toPromise();
                if (latestVersion !== this.currentVersion) {
                    this.numberVersionError++;
                }
            } catch (e) {
                this.alert.addAlert('danger', e);
            }
            if (isSiteAdmin(this.userService.user)) this.getNotifications();
        }, (window as any).versionCheckIntervalInSeconds * 1000);
    }

    getNotifications() {
        this.http.get('/server/notification/').subscribe((result: any) => {
            this.numberServerError = result.serverErrorCount;
            this.numberClientError = result.clientErrorCount;
            this.numberError = this.numberServerError + this.numberClientError;
        }, err => this.alert.addAlert('danger', err));
    }

}
