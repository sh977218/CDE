import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import _isArray from 'lodash/isArray';
import _noop from 'lodash/noop';

import { AlertService } from '_app/alert/alert.service';
import { UserService } from '_app/user.service';
import { DataElement } from 'shared/de/dataElement.model';
import { CdeForm } from 'shared/form/form.model';
import { User } from 'shared/models.model';
import { PushNotificationSubscriptionService } from '_app/pushNotificationSubscriptionService';


@Component({
    selector: 'cde-profile',
    templateUrl: 'profile.component.html'
})
export class ProfileComponent {
    cdes: any = [];
    forms: any = [];
    hasQuota: any;
    orgCurator: string;
    orgAdmin: string;
    user: User;
    subscriptionStatusClient = PushNotificationSubscriptionService.subscriptionCheckClient;
    subscriptionStatusServer: string;

    constructor(private alert: AlertService,
                private http: HttpClient,
                private userService: UserService) {
        this.http.get('/viewingHistory/dataElement').subscribe(response => {
            this.cdes = response;
            if (_isArray(response)) this.cdes.forEach((elt, i, elts) => elts[i] = DataElement.copy(elt));
            else this.cdes = [];
        }, err => this.alert.httpErrorMessageAlert(err, 'Error, unable to retrieve data element view history.'));
        this.http.get('/viewingHistory/form').subscribe(response => {
            this.forms = response;
            if (_isArray(response)) this.forms.forEach((elt, i, elts) => elts[i] = CdeForm.copy(elt));
            else this.forms = [];
        }, err => this.alert.httpErrorMessageAlert(err, 'Error, unable to retrieve form view history.'));
        this.reloadUser();
    }

    checkSubscriptionServerStatus() {
        this.checkSubscriptionServerStatusEndpoint().then(
            () => {
                PushNotificationSubscriptionService.lastUser = this.user._id;
                this.subscriptionStatusServer = 'Subscribed';
            },
            err => {
                this.subscriptionStatusServer = (err !== 'Network Error' ? 'Not Subscribed' : 'Network Error');
            }
        );
    }

    checkSubscriptionServerStatusEndpoint(): Promise<void> {
        if (PushNotificationSubscriptionService.lastEndpoint) {
            return PushNotificationSubscriptionService.subscriptionServerUpdate(this.user._id)
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
            return PushNotificationSubscriptionService.subscriptionServerUpdate(this.user._id);
        });
    }

    reloadUser() {
        this.userService.then(user => {
            this.hasQuota = user.quota;
            this.orgCurator = user.orgCurator.toString().replace(/,/g, ', ');
            this.orgAdmin = user.orgAdmin.toString().replace(/,/g, ', ');
            this.user = user;
        }, _noop);
    }

    removePublishedForm(pf) {
        this.user.publishedForms = this.user.publishedForms.filter(function (p: any) {
            return p._id !== pf._id;
        });
        this.saveProfile();
    }

    saveProfile() {
        this.http.post('/user', this.user, {responseType: 'text'}).subscribe(
            () => {
                this.reloadUser();
                this.alert.addAlert('success', 'Saved');
            },
            () => this.alert.addAlert('danger', 'Error, unable to save')
        );
    }

    pushSubscribe() {
        PushNotificationSubscriptionService.subscriptionNew(this.user._id).then(() => {
            this.subscriptionStatusServer = 'Subscribed';
        }, _noop);
    }

    pushUnsubscribe() {
        PushNotificationSubscriptionService.subscriptionDelete(this.user._id).then(() => {
            this.subscriptionStatusServer = 'Not Subscribed';
        });
    }
}
