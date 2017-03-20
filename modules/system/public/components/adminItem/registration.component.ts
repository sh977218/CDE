import {Component, Inject, Input, ViewChild} from "@angular/core";
import {ModalDirective} from "ng2-bootstrap/modal";
import "rxjs/add/operator/map";
import { Http } from "@angular/http";

@Component({
    selector: "cde-registation",
    templateUrl: "./registration.component.html"
})

export class RegistrationComponent {

    @ViewChild("childModal") public childModal: ModalDirective;
    @Input() elt: any;


    validRegStatuses: string[] = ['Retired', 'Incomplete', 'Candidate' ];

    constructor (private http: Http,
                 @Inject("Alert") private alert,
                 @Inject("isAllowedModel") private isAllowedModel,
                 @Inject("userResource") private userService
    ) {}

    openRegStatusUpdate () {
        this.http.get('/comments/eltId/' + this.elt.tinyId).map(res => res.json()).subscribe((response) => {
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

    doUpdate() {
        // why?
        // location.assign($scope.baseLink + newElt.tinyId);
        this.alert.addAlert("success", "Saved");
    }

    setHelpMessage () {
        regStatusShared.statusList.forEach(function(status) { // jshint ignore:line
            if (status.name === $scope.elt.registrationState.registrationStatus)
                $scope.helpMessage = status.curHelp;
        });
    };

    ok () {
        this.http.post("/dataelement/" + this.elt._id, this.elt).subscribe(() => this.childModal.hide());
    }

}