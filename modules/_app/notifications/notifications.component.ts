import { Component } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AlertService } from '_app/alert.service';
import { UserService } from '_app/user.service';
import { forkJoin } from 'rxjs/observable/forkJoin';

@Component({
    selector: 'cde-notifications',
    templateUrl: 'notifications.component.html',
    styles: [`
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
    readNotifications = [{_id: {title: "You have no new notifications. "}}];
    unreadNotifications = [];

    constructor(private http: HttpClient,
                private userService: UserService,
                private alert: AlertService) {
        setInterval(async () => {
            try {
                const latestVersion = await this.http.get("/site-version", {responseType: 'text'}).toPromise();
                if (latestVersion !== this.currentVersion) {
                    let note = "A new version of this site is available. To enjoy the new features, \n" +
                        "please close all instances / tabs of this site then load again. ";
                    this.unreadNotifications.unshift({_id: {title: note}});
                }
            } catch (e) {
                this.alert.addAlert('danger', e);
            }
            if (this.userService.user) this.getNotifications();
        }, (window as any).versionCheckIntervalInSeconds * 1000);
    }

    getNotifications(cb?) {
        let obs1 = this.http.get<any[]>("/unreadNotifications");
        let obs2 = this.http.get<any[]>("/notifications");
        forkJoin([obs1, obs2]).subscribe(results => {
            this.unreadNotifications = results[0];
            this.readNotifications = results[1];
            if (cb) cb();
        }, err => this.alert.addAlert('danger', err));
    }

    viewNotification(notification) {
        this.http.get("/viewedNotification")
            .subscribe(() => this.getNotifications(() => NotificationsComponent.navigateNotification(notification)),
                err => this.alert.addAlert('danger', err));
    }

    static navigateNotification(notification) {
        if (notification && notification._id && notification._id.url) window.open(notification._id.url, '_blank');
    }
}
