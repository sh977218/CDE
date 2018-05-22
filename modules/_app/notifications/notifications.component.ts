import { Component } from "@angular/core";
import { HttpClient } from "@angular/common/http";

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

    constructor(private http: HttpClient) {
        setInterval(async () => {
            try {
                const latestVersion = await this.http.get("/site-version", {responseType: 'text'}).toPromise();
                if (latestVersion !== this.currentVersion) {
                    let note = "A new version of this site is available. To enjoy the new features, \n" +
                        "please close all instances / tabs of this site then load again. ";
                    if (this.notifications.indexOf(note) === -1) this.notifications.push(note);
                }
                const notifications = await this.http.get<any[]>("/notifications", {responseType: 'text'}).toPromise();
                this.notifications = notifications;
            } catch (e) {
            }
        }, (window as any).versionCheckIntervalInSeconds * 1000);
    }
}