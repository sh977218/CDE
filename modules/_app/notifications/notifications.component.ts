import { Component } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AlertService } from '_app/alert.service';
import { UserService } from '_app/user.service';
import { forkJoin } from 'rxjs/observable/forkJoin';

@Component({
    selector: 'cde-notifications',
    templateUrl: 'notifications.component.html',
    styles: [`
        #notificationBellIcon {
            font-size: 1.3em;
            margin-top: 10px
        }
    `]
})
export class NotificationsComponent {

    currentVersion = (window as any).version;
    numberVersionError;
    numberServerError;
    numberClientError;
    numberError;

    constructor(private http: HttpClient,
                private userService: UserService,
                private alert: AlertService) {
        let versionCheckFn = setInterval(async () => {
            try {
                const latestVersion = await this.http.get("/site-version", {responseType: 'text'}).toPromise();
                if (latestVersion !== this.currentVersion) {
                    this.numberVersionError++;
                    clearInterval(versionCheckFn);
                }
            } catch (e) {
                this.alert.addAlert('danger', e);
            }
            if (this.userService.user) this.getNotifications();
        }, (window as any).versionCheckIntervalInSeconds * 1000);
    }

    getNotifications(cb?) {
        let serverObs = this.http.get<any>("/server/notification/serverError");
        let clientObs = this.http.get<any>("/server/notification/clientError");
        this.http.get('/server/notification/').subscribe((result: any) => {
            this.numberServerError = result.serverErrorCount;
            this.numberClientError = result.clientErrorCount;
            this.numberError = this.numberServerError + this.numberClientError;
            if (cb) cb();
        }, err => this.alert.addAlert('danger', err));
    }

}
