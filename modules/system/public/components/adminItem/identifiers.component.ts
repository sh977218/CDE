import { Component, Inject, Input, ViewChild } from "@angular/core";
import { Http } from "@angular/http";
import { ModalDirective } from "ng2-bootstrap/modal";
import "rxjs/add/operator/map";

@Component({
    selector: "cde-admin-item-ids",
    templateUrl: "./identifiers.component.html"
})


export class IdentifiersComponent {

    @ViewChild( "childModal" ) public childModal:ModalDirective;
    @Input( ) public elt:any;

    constructor(private http: Http,
                @Inject("Alert") private alert,
                @Inject("isAllowedModel") private isAllowedModel) {

    }

    openNewId () {
        this.childModal.show();
    }
        //    $modal.open({
    //        animation: false,
    //        templateUrl: 'newIdModalContent.html',
    //        controller: 'NewIdModalCtrl',
    //        resolve: {
    //            elt: function() {
    //                return $scope.elt;
    //            }
    //        }
    //    }).result.then(function (newId) {
    //        $scope.elt.ids.push(newId);
    //        if ($scope.elt.unsaved) {
    //            $scope.addAlert("info", "Identifier added. Save to confirm.")
    //        } else {
    //            $scope.elt.$save(function(newElt) {
    //                $scope.elt = newElt;
    //                this.alert.addAlert("success", "Identifier Added");
    //            });
    //        }
    //    }, function () {});
    //}
    //
    removeId (index) {
        this.elt.ids.splice(index, 1);
        if (this.elt.unsaved) {
            this.alert.addAlert("info", "Identifier removed. Save to confirm.")
        } else {
            this.elt.$save(function(newElt) {
                this.elt = newElt;
                this.alert.addAlert("success", "Identifier Removed");
            });
        }
    }


}