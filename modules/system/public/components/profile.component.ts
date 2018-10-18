import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import _noop from 'lodash/noop';

import { AlertService } from 'alert/alert.service';
import { PushNotificationSubscriptionService } from '_app/pushNotificationSubscriptionService';
import { UserService } from '_app/user.service';
import { PublishedForm, User } from 'shared/models.model';
import { DataElement } from 'shared/de/dataElement.model';
import { CdeForm } from 'shared/form/form.model';

@Component({
    selector: 'cde-profile',
    templateUrl: 'profile.component.html'
})
export class ProfileComponent {
    cdes: DataElement[] = [];
    forms: CdeForm[] = [];
    hasQuota: any;
    orgCurators?: string;
    orgAdmins?: string;
    user?: User;
    subscriptionStatusClient = PushNotificationSubscriptionService.subscriptionCheckClient;
    subscriptionStatusServer?: string;

    constructor(private alert: AlertService,
                private http: HttpClient,
                public userService: UserService) {
        this.http.get<DataElement[]>('/viewingHistory/dataElement').subscribe(
            response => this.cdes = Array.isArray(response) ? response : [],
            err => this.alert.httpErrorMessageAlert(err, 'Error, unable to retrieve data element view history.')
        );
        this.http.get<CdeForm[]>('/viewingHistory/form').subscribe(
            response => this.forms = Array.isArray(response) ? response : [],
            err => this.alert.httpErrorMessageAlert(err, 'Error, unable to retrieve form view history.')
        );
        this.reloadUser();
    }

    checkSubscriptionServerStatus() {
        this.checkSubscriptionServerStatusEndpoint().then(
            () => {
                PushNotificationSubscriptionService.lastUser = this.user!._id;
                this.subscriptionStatusServer = 'Subscribed';
            },
            err => {
                this.subscriptionStatusServer = (err !== 'Network Error' ? 'Not Subscribed' : 'Network Error');
            }
        );
    }

    checkSubscriptionServerStatusEndpoint(): Promise<void> {
        if (PushNotificationSubscriptionService.lastEndpoint) {
            return PushNotificationSubscriptionService.subscriptionServerUpdate(this.user!._id)
                .catch(() => {
                    PushNotificationSubscriptionService.lastEndpoint = '';
                    return this.checkSubscriptionServerStatusNoEndpoint();
                });
        } else {
            return this.checkSubscriptionServerStatusNoEndpoint();
        }
    }

    checkSubscriptionServerStatusNoEndpoint(): Promise<void> {
        return PushNotificationSubscriptionService.getEndpoint().then(() => {
            return PushNotificationSubscriptionService.subscriptionServerUpdate(this.user!._id);
        });
    }

    pushSubscribe() {
        PushNotificationSubscriptionService.subscriptionNew(this.user!._id).then(() => {
            this.subscriptionStatusServer = 'Subscribed';
        }, _noop);
    }

    pushUnsubscribe() {
        PushNotificationSubscriptionService.subscriptionDelete(this.user!._id).then(() => {
            this.subscriptionStatusServer = 'Not Subscribed';
        });
    }

    reloadUser() {
        this.userService.then(user => {
            this.hasQuota = user.quota;
            this.orgCurators = user.orgCurator ? user.orgCurator.join(', ') : '';
            this.orgAdmins = user.orgAdmin ? user.orgAdmin.join(', ') : '';
            this.user = user;
        });
    }

    removePublishedForm(pf: PublishedForm) {
        this.user!.publishedForms = this.user!.publishedForms ? this.user!.publishedForms!.filter( p =>
            p._id !== pf._id) : [];
        this.saveProfile();
    }

    saveProfile() {
        this.http.post('/server/user/', this.user).subscribe(
            () => {
                this.reloadUser();
                this.alert.addAlert('success', 'Saved');
            }, () => this.alert.addAlert('danger', 'Error, unable to save')
        );
    }
}
