import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, ViewChild, OnInit } from '@angular/core';
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import _noop from 'lodash/noop';

import { AlertService } from '_app/alert.service';
import { UserService } from '_app/user.service';
import { Comment } from 'shared/models.model';
import { statusList } from 'shared/system/regStatusShared';

@Component({
    selector: 'cde-registration',
    templateUrl: './registration.component.html',
    providers: [NgbActiveModal]
})
export class RegistrationComponent implements OnInit {
    @Input() canEdit: boolean = false;
    @Input() elt: any;
    @Output() onEltChange = new EventEmitter();
    @ViewChild('regStatusEdit') regStatusEditModal: NgbModalModule;
    helpMessage: string;
    newState: any = {};
    modalRef: NgbModalRef;
    validRegStatuses: string[] = ['Retired', 'Incomplete', 'Candidate'];

    ngOnInit() {
        this.newState = {registrationStatus: this.elt.registrationState.registrationStatus};
    }

    constructor (
        private alert: AlertService,
        private http: HttpClient,
        public modalService: NgbModal,
        private parserFormatter: NgbDateParserFormatter,
        private userService: UserService,
    ) {}

    ok() {
        this.elt.registrationState = this.newState;
        this.elt.registrationState.effectiveDate = this.parserFormatter.format(this.newState.effectiveDate);
        this.elt.registrationState.untilDate = this.parserFormatter.format(this.newState.untilDate);
        this.onEltChange.emit();
        this.modalRef.close();
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

            this.modalRef = this.modalService.open(this.regStatusEditModal, {size: 'lg'});
        });
    }

    setHelpMessage(newValue) {
        statusList.forEach((status) => {
            if (status.name === newValue) this.helpMessage = status.curHelp;
        });
    }
}
