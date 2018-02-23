import { Component } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Component({
    selector: 'cde-notifications',
    templateUrl: 'notifications.component.html'
})
export class NotificationsComponent {

    currentVersion = (window as any).version + "a";
    notifications = [];

    constructor(private http: HttpClient) {
        setInterval(async () => {
            const latestVersion = await this.http.get("/site-version", {responseType: 'text'}).toPromise();
            if (latestVersion !== this.currentVersion) {
                // TODO don't dup the push
                let note = "A new version of this site is available. To enjoy the new features, \n" +
                    "please close all instances / tabs of this site and reload this page. ";
                if (this.notifications.indexOf(note) === -1) this.notifications.push(note);
            }
        // }, 1000 * 60 * 30);
        }, 1000 * 10);
    }

}