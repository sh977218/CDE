import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

import { AlertService } from 'alert/alert.service';
import { UserService } from '_app/user.service';
import { IsAllowedService } from 'non-core/isAllowed.service';


@Component({
    selector: 'cde-steward-org-transfer',
    templateUrl: './stewardOrgTransfer.component.html'
})
export class StewardOrgTransferComponent {
    transferStewardObj = {};

    constructor(private alert: AlertService,
                private http: HttpClient,
                public isAllowedModel: IsAllowedService,
                public userService: UserService) {

    }


    transferSteward() {
        this.http.post('/transferSteward', this.transferStewardObj, {responseType: 'text'}).subscribe(r => {
            this.alert.addAlert('success', r);
            this.transferStewardObj = {};
        }, () => {
            this.alert.addAlert('danger', 'An error occurred.');
            this.transferStewardObj = {};
        });
    }
}
