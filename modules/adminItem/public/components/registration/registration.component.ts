import { Component, EventEmitter, Input, Output, ViewChild, OnInit } from '@angular/core';
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import 'rxjs/add/operator/map';
import { Http } from '@angular/http';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { SharedService } from 'core/shared.service';
import { IsAllowedService } from 'core/isAllowed.service';
import { UserService } from '_app/user.service';
import { AlertService } from '_app/alert/alert.service';

@Component({
    selector: 'cde-registration',
    templateUrl: './registration.component.html',
    providers: [NgbActiveModal]
})

export class RegistrationComponent implements OnInit {
    @ViewChild('regStatusEdit') public regStatusEditModal: NgbModalModule;
    @Input() public elt: any;
    @Output() save = new EventEmitter();
    helpMessage: string;
    newState: any = {};
    public modalRef: NgbModalRef;

    validRegStatuses: string[] = ['Retired', 'Incomplete', 'Candidate'];

    constructor (private http: Http,
                 private parserFormatter: NgbDateParserFormatter,
                 private alert: AlertService,
                 public isAllowedModel: IsAllowedService,
                 private userService: UserService,
                 public modalService: NgbModal
    ) {}

    ngOnInit(): void {
        this.newState = {registrationStatus: this.elt.registrationState.registrationStatus};
    }

    openRegStatusUpdate() {
        if (this.elt.isDraft) {
            return this.alert.addAlert("warning", "Please publish this draft before editing status");
        }

        this.http.get('/comments/eltId/' + this.elt.tinyId).map(res => res.json()).subscribe((response) => {
            if (response.filter && response.filter(function (a) {
                    return a.status !== 'resolved' && a.status !== 'deleted';
                }).length > 0) {
                this.alert.addAlert('info', 'Info: There are unresolved comments. ');
            }

            this.http.get('/org/' + encodeURIComponent(this.elt.stewardOrg.name)).map(res => res.json()).subscribe((res) => {
                if (!res.workingGroupOf || res.workingGroupOf.length < 1) {
                    this.validRegStatuses = this.validRegStatuses.concat(['Recorded', 'Qualified']);
                    if (this.userService.user.siteAdmin) {
                        this.validRegStatuses = this.validRegStatuses.concat(['Standard', 'Preferred Standard']);
                    }
                }
                this.validRegStatuses.reverse();
            });

            this.modalRef = this.modalService.open(this.regStatusEditModal, {size: 'lg'});
        });
    }

    setHelpMessage(newValue) {
        SharedService.regStatusShared.statusList.forEach((status) => {
            if (status.name === newValue) this.helpMessage = status.curHelp;
        });
    };

    ok() {
        this.elt.registrationState = this.newState;
        this.elt.registrationState.effectiveDate = this.parserFormatter.format(this.newState.effectiveDate);
        this.elt.registrationState.untilDate = this.parserFormatter.format(this.newState.untilDate);
        this.save.emit();
        this.modalRef.close();
    }

}
