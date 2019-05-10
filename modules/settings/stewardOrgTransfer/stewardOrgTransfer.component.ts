import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

import { AlertService } from 'alert/alert.service';
import { UserService } from '_app/user.service';
import { IsAllowedService } from 'non-core/isAllowed.service';

class TRANSFER_STEWARD_OB {
    from: string = '';
    to: string = '';
}

@Component({
    selector: 'cde-steward-org-transfer',
    templateUrl: './stewardOrgTransfer.component.html'
})
export class StewardOrgTransferComponent {
    transferStewardObj: TRANSFER_STEWARD_OB = new TRANSFER_STEWARD_OB();

    constructor(private alert: AlertService,
                private http: HttpClient,
                public isAllowedModel: IsAllowedService,
                public userService: UserService) {

    }


    transferSteward() {
        this.http.post('/transferSteward', this.transferStewardObj, {responseType: 'text'}).subscribe(r => {
            this.alert.addAlert('success', r);
            this.transferStewardObj = new TRANSFER_STEWARD_OB();
        }, () => {
            this.alert.addAlert('danger', 'An error occurred.');
            this.transferStewardObj = new TRANSFER_STEWARD_OB();
        });
    }
}
