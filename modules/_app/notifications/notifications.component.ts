import { Component } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AlertService } from '_app/alert/alert.service';
import { UserService } from '_app/user.service';

@Component({
    selector: 'cde-notifications',
    templateUrl: 'notifications.component.html',
    styles: [`
    .button_badge {
      background-color: #fa3e3e;
      border-radius: 4px;
      color: white;

      padding: 1px 3px;
      font-size: 10px;

      position: absolute; /* Position the badge within the relatively positioned button */
      top: 4px;
      right: 2px;
    }
    `]
})
export class NotificationsComponent {

    currentVersion = (window as any).version;
    notifications = [];

    constructor(private http: HttpClient,
                private userService: UserService,
                private alert: AlertService) {
        setInterval(async () => {
            try {
                const latestVersion = await this.http.get("/site-version", {responseType: 'text'}).toPromise();
                if (latestVersion !== this.currentVersion) {
                    let note = "A new version of this site is available. To enjoy the new features, \n" +
                        "please close all instances / tabs of this site then load again. ";
                    this.notifications.unshift({title: note});
                }
            } catch (e) {
                this.alert.addAlert('danger', e);
            }
            if (this.userService.user) this.getNotification();
        }, (window as any).versionCheckIntervalInSeconds * 1000);
    }

    getNotification() {
        this.http.get<any[]>("/notifications")
            .subscribe(res => this.notifications = res,
                err => this.alert.addAlert('danger', err));
    }

    viewNotification() {
        this.http.get("/viewedNotification")
            .subscribe(() => this.getNotification(),
                err => this.alert.addAlert('danger', err));
    }

    resetDateToBefore() {
        this.http.get("/resetDateToBefore");
    }
}