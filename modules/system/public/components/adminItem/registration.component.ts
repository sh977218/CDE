import { Component, Inject, Input, ViewChild, OnInit } from "@angular/core";
import {ModalDirective} from "ng2-bootstrap/modal";
import "rxjs/add/operator/map";
import { Http } from "@angular/http";

@Component({
    selector: "cde-registation",
    templateUrl: "./registration.component.html"
})

export class RegistrationComponent implements OnInit {
    @ViewChild("childModal") public childModal: ModalDirective;
    @Input() elt: any;
    regStatusShared: any = require("../../../shared/regStatusShared");
    helpMessage: string;
    newState: any = {};

    validRegStatuses: string[] = ["Retired", "Incomplete", "Candidate" ];

    constructor (private http: Http,
                 @Inject("Alert") private alert,
                 @Inject("isAllowedModel") private isAllowedModel,
                 @Inject("userResource") private userService
    ) {}

    ngOnInit(): void {
        this.newState = {regisrationStatus: this.elt.registrationState.registrationStatus};
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


            this.childModal.show();
            // $modal.open({
            // }).result.then(function (newElt) {
            // }, function () {
            //     $scope.revert($scope.elt);
            // });
        });
    }

    setHelpMessage (newValue) {
        this.regStatusShared.statusList.forEach((status) => {
            if (status.name === newValue) this.helpMessage = status.curHelp;
        });
    };

    ok () {
        this.elt.registrationState = this.newState;
        this.http.post("/debytinyid/" + this.elt.tinyId, this.elt).subscribe(() => this.childModal.hide());
    }

}