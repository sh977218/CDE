import { Component, Inject, Input, ViewChild, OnInit } from "@angular/core";
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import "rxjs/add/operator/map";
import { Http } from "@angular/http";
import { NgbDateParserFormatter } from "@ng-bootstrap/ng-bootstrap";

@Component({
    selector: "cde-registation",
    templateUrl: "./registration.component.html",
    providers: [NgbActiveModal]
})

export class RegistrationComponent implements OnInit {
    @ViewChild("regStatusEdit") public regStatusEditModal: NgbModalModule;
    @Input() elt: any;
    regStatusShared: any = require("../../../shared/regStatusShared");
    helpMessage: string;
    newState: any = {};
    public modalRef: NgbModalRef;

    validRegStatuses: string[] = ["Retired", "Incomplete", "Candidate" ];

    constructor (private http: Http,
                 private parserFormatter: NgbDateParserFormatter,
                 @Inject("Alert") private alert,
                 @Inject("isAllowedModel") private isAllowedModel,
                 @Inject("userResource") private userService,
                 public modalService: NgbModal
    ) {}

    ngOnInit(): void {
        this.newState = {registrationStatus: this.elt.registrationState.registrationStatus};
    }

    openRegStatusUpdate () {

        this.http.get("/comments/eltId/" + this.elt.tinyId).map(res => res.json()).subscribe((response) => {
            if (response.filter && response.filter(function (a) {
                    return a.status !== 'resolved' && a.status !== 'deleted'
                }).length > 0) {
                this.alert.addAlert('info', "Info: There are unresolved comments. ")
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

            this.modalRef = this.modalService.open(this.regStatusEditModal, {size: "lg"});
        });
    }

    setHelpMessage (newValue) {
        this.regStatusShared.statusList.forEach((status) => {
            if (status.name === newValue) this.helpMessage = status.curHelp;
        });
    };

    ok () {
        this.elt.registrationState = this.newState;
        this.elt.registrationState.effectiveDate = this.parserFormatter.format(this.newState.effectiveDate);
        this.elt.registrationState.untilDate = this.parserFormatter.format(this.newState.untilDate);
        this.elt.$save(() => {
            this.modalRef.close();
            this.alert.addAlert("success", "Saved");
        });
    }

}