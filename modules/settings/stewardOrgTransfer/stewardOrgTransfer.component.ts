import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import { IsAllowedService } from 'non-core/isAllowed.service';

class TransferSteward {
    from: string = '';
    to: string = '';
}

@Component({
    selector: 'cde-steward-org-transfer',
    templateUrl: './stewardOrgTransfer.component.html'
})
export class StewardOrgTransferComponent {
    transferStewardObj: TransferSteward = new TransferSteward();

    constructor(private alert: AlertService,
                private http: HttpClient,
                public isAllowedModel: IsAllowedService,
                public userService: UserService) {
    }


    transferSteward() {
        this.http.post('/server/orgManagement/transferSteward', this.transferStewardObj, {responseType: 'text'})
            .subscribe(r => {
                this.alert.addAlert('success', r);
                this.transferStewardObj = new TransferSteward();
            }, () => {
                this.alert.addAlert('danger', 'An error occurred.');
                this.transferStewardObj = new TransferSteward();
            });
    }
}
