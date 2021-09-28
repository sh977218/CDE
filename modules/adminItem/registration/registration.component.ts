import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, ViewChild, OnInit, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import * as _noop from 'lodash/noop';
import { AdministrativeStatus, administrativeStatuses, Comment, CurationStatus, Item, RegistrationState } from 'shared/models.model';
import { statusList } from 'shared/regStatusShared';

@Component({
    selector: 'cde-registration',
    templateUrl: './registration.component.html',
})
export class RegistrationComponent implements OnInit {
    @Input() canEdit = false;
    @Input() elt!: Item;
    @Output() eltChange = new EventEmitter();
    @ViewChild('regStatusEdit', {static: true}) regStatusEditModal!: TemplateRef<any>;
    helpMessage?: string;
    newState!: RegistrationState;
    validRegStatuses: string[] = ['Retired', 'Incomplete', 'Candidate'];
    validAdminStatus: readonly AdministrativeStatus[] = administrativeStatuses;

    constructor(
        private alert: AlertService,
        private http: HttpClient,
        public dialog: MatDialog,
        private userService: UserService,
    ) {
    }

    ngOnInit() {
        this.newState = {
            registrationStatus: this.elt.registrationState.registrationStatus,
            administrativeStatus: this.elt.registrationState.administrativeStatus
        };
    }

    openRegStatusUpdate() {
        this.validRegStatuses = ['Retired', 'Incomplete'];
        if (this.elt.classification && this.elt.classification.some(cl => cl.stewardOrg.name !== 'TEST')) {
            this.validRegStatuses.push('Candidate');
            this.http.get<any>('/server/orgManagement/org/' + encodeURIComponent(this.elt.stewardOrg.name || '')).subscribe(res => {
                this.userService.catch(_noop).then(user => {
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
        this.dialog.open(this.regStatusEditModal, {width: '1000px'}).afterClosed().subscribe(res => {
            if (res) {
                this.elt.registrationState = this.newState;
                this.eltChange.emit();
            }
        });
    }

    setHelpMessage(newValue: CurationStatus) {
        statusList.forEach(status => {
            if (status.name === newValue) {
                this.helpMessage = status.curHelp;
            }
        });
    }
}
