import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, ViewChild, OnInit, TemplateRef } from '@angular/core';
import _noop from 'lodash/noop';

import { AlertService } from '_app/alert.service';
import { UserService } from '_app/user.service';
import { Comment, RegistrationState } from 'shared/models.model';
import { statusList } from 'shared/system/regStatusShared';
import { MatDialog } from '@angular/material';

@Component({
    selector: 'cde-registration',
    templateUrl: './registration.component.html',
})
export class RegistrationComponent implements OnInit {
    @Input() canEdit: boolean = false;
    @Input() elt: any;
    @Output() onEltChange = new EventEmitter();
    @ViewChild('regStatusEdit') regStatusEditModal: TemplateRef<any>;
    helpMessage: string;
    newState: RegistrationState;
    validRegStatuses: string[] = ['Retired', 'Incomplete', 'Candidate'];

    constructor (
        private alert: AlertService,
        private http: HttpClient,
        public dialog: MatDialog,
        private userService: UserService,
    ) {}

    ngOnInit() {
        this.newState = {registrationStatus: this.elt.registrationState.registrationStatus};
    }

    openRegStatusUpdate() {
        this.http.get<Comment[]>('/server/discuss/comments/eltId/' + this.elt.tinyId).subscribe((response) => {
            if (Array.isArray(response) && response.filter(function (a) {
                    return a.status !== 'resolved' && a.status !== 'deleted';
                }).length > 0) {
                this.alert.addAlert('info', 'Info: There are unresolved comments. ');
            }

            this.validRegStatuses = ['Retired', 'Incomplete', 'Candidate'];

            this.http.get<any>('/org/' + encodeURIComponent(this.elt.stewardOrg.name)).subscribe(res => {
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

            this.dialog.open(this.regStatusEditModal, {width: '1000px'}).afterClosed().subscribe(res => {
                if (res) {
                    this.elt.registrationState = this.newState;
                    this.onEltChange.emit();
                }
            });
        });
    }

    setHelpMessage(newValue) {
        statusList.forEach(status => {
            if (status.name === newValue) this.helpMessage = status.curHelp;
        });
    }
}
