import { Component, Inject, Input, ViewChild } from "@angular/core";
import { ModalDirective } from "ng2-bootstrap/modal";

@Component({
    selector: "cde-linked-forms",
    templateUrl: "./linkedForms.component.html"
})


export class LinkedFormsComponent {

    @ViewChild("childModal") public childModal: ModalDirective;
    @Input() public cde: any;
    @Input() public parent: string;

    pinModal: any;
    cutoffIndex = 20;
    forms: [any];

    constructor (@Inject("QuickBoard") private quickBoard,
                 @Inject("PinModal") private pinModalSvc,
                 @Inject("Elastic") private elastic
    ) {
          this.pinModal = pinModalSvc.new("form");
    };

    private open () {
        let searchSettings = this.elastic.defaultSearchSettings;
        searchSettings.q = '"' + this.cde.tinyId + '"';

        this.elastic.generalSearchQuery(this.elastic.buildElasticQuerySettings(searchSettings), "form", (err, result) => {
            if (err) return;
            this.forms = result.forms;
            this.childModal.show();
        });
    }


    // $scope.$on('loadLinkedForms', function() {
    //     $scope.$parent.took = null;
    //     $scope.reload("form");
    //
    //     var finishLoadLinkedForms = $interval(function () {
    //         if ($scope.took) {
    //             $interval.cancel(finishLoadLinkedForms);
    //             var searchterm = $scope.currentSearchTerm.slice(1, -1);
    //             var self = $scope.forms.filter(function (elt) {
    //                 return elt.tinyId === searchterm;
    //             });
    //             if (self.length)
    //                 $scope.forms.splice($scope.forms.indexOf(self[0]), 1);
    //         }
    //     }, 0);
    // });

    //
    // $scope.includeInAccordion = [
    //     "/cde/public/html/accordion/pinAccordionActions.html",
    //     "/system/public/html/accordion/addToQuickBoardActions.html"
    // ];
    //
    getFormText = function() {
        if (this.parent === "cde") {
            if (!this.forms || this.forms.length === 0) {
                return "There are no forms that use this CDE.";
            }
            else if (this.forms.length === 1) {
                return "There is 1 form that uses this CDE.";
            }
            else if (this.forms.length >= 20) {
                return "There are more than 20 forms that use this CDE.";
            }
            else {
                return "There are " + this.forms.length + " that use this CDE.";
            }
        }
        if (this.parent === "form") {
            if (!this.forms || this.forms.length === 0) {
                return "There are no forms that use this form.";
            }
            else if (this.forms.length === 1) {
                return "There is 1 form that uses this form.";
            }
            else if (this.forms.length >= 20) {
                return "There are more than 20 forms that use this form.";
            }
            else {
                return "There are " + this.forms.length + " that use this form.";
            }
        }
    };

    // $scope.formsCtrlLoadedPromise.resolve();



}