import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { administrativeStatuses, CurationStatus, RegistrationState } from 'shared/models.model';
import { statusList } from 'shared/regStatusShared';
import { noop } from 'shared/util';
import { cloneDeep } from 'lodash';
import { HttpClient } from '@angular/common/http';
import { UserService } from '_app/user.service';

@Component({
    templateUrl: './registration-status-modal.component.html',
})
export class RegistrationStatusModalComponent {
    registrationState: RegistrationState;
    validRegStatuses;
    validAdminStatus = administrativeStatuses;
    helpMessage?: string;

    constructor(private http: HttpClient,
                @Inject(MAT_DIALOG_DATA) public data: any,
                public dialog: MatDialog,
                public userService: UserService) {
        this.registrationState = cloneDeep(this.data.registrationState);
        const elt = this.data
        this.validRegStatuses = ['Retired', 'Incomplete'];
        if (elt.classification && elt.classification.some(cl => cl.stewardOrg.name !== 'TEST')) {
            this.validRegStatuses.push('Candidate');
            this.http.get<any>('/server/orgManagement/org/' + encodeURIComponent(elt.stewardOrg.name || ''))
                .subscribe(res => {
                    this.userService.catch(noop).then(user => {
                        if (!res.workingGroupOf || res.workingGroupOf.length < 1) {
                            this.validRegStatuses = this.validRegStatuses.concat(['Recorded', 'Qualified']);
                            if (user && user.siteAdmin) {
                                this.validRegStatuses = this.validRegStatuses.concat(['Standard', 'Preferred Standard']);
                            }
                        }
                        this.validRegStatuses.reverse();
                    });
                });
        } else {
            this.helpMessage = 'Elements that are not classified (or only classified by TEST ' +
                'can only have Incomplete or Retired status';
        }
    }

    setHelpMessage(newValue: CurationStatus) {
        statusList.forEach(status => {
            if (status.name === newValue) {
                this.helpMessage = status.curHelp;
            }
        });
    }

}
