import { Http } from "@angular/http";
import { Component, Inject, Input, ViewChild } from "@angular/core";
import { ModalDirective } from "ng2-bootstrap/modal";

@Component({
    selector: "cde-derivation-rules",
    templateUrl: "./derivationRules.component.html"
})


export class DerivationRulesComponent {

    @ViewChild("childModal") public childModal:ModalDirective;
    @Input() public elt:any;

    constructor(private http: Http,
                @Inject("isAllowedModel") private isAllowedModel) {

        this.updateRules();
        this.findDerivationOutputs();

    }

    newDerivationRule: {
        ruleType: "score",
        formula: "sumAll",
        inputs: [any]
    };

    updateRules () {
        if (this.elt.derivationRules) {
            this.elt.derivationRules.forEach(function(dr) {
                if (dr.inputs[0] !== null) {
                    this.http.post("/cdesByTinyIdList", dr.inputs, function(result) {
                        dr.fullCdes = result;
                        //dr.cdeNamesAsString = result.map(function(r) {return r.naming[0].designation}).join(' , ');
                    });
                }
            });
        }
    };

    //$scope.deferredEltLoaded.promise.then(updateRules);

    findDerivationOutputs () {
        if (!this.elt.derivationOutputs) {
            this.elt.derivationOutputs = [];
            this.http.get("/cde/derivationOutputs/" + this.elt.tinyId, function(result) {
                result.data.forEach(function(outputCde) {
                    outputCde.derivationRules.forEach(function(derRule) {
                        if (derRule.inputs.indexOf(this.elt.tinyId) > -1) {
                            this.elt.derivationOutputs.push({ruleName: derRule.name, cde: outputCde});
                        }
                    });
                });
            });
        }
    };

    //$scope.$on('elementReloaded', function() {
    //    updateRules();
    //    if ($scope.tabs.derivationRules.active) {
    //        findDerivationOutputs();
    //    }
    //});

    //$scope.$on('loadDerivationRules', findDerivationOutputs);

    openNewScore () {
        this.childModal.show();
    };

    okCreate () {
        this.childModal.hide();
        if (!this.elt.derivationRules) this.elt.derivationRules = [];
        quickBoard.elts.forEach(function(qbElt) {
            newDerivationRule.inputs.push(qbElt.tinyId);
        });
        this.elt.derivationRules.push(newDerivationRule);
        $scope.stageElt($scope.elt);
        updateRules();
    };


    $scope.removeDerivationRule = function (index) {
    $scope.elt.derivationRules.splice(index, 1);
    $scope.stageElt($scope.elt);
};

    $scope.canAddScore = function() {
    if (!$scope.isOrgCurator($scope.user)) return false;
    if ($scope.elt.derivationRules) {
        return $scope.elt.derivationRules.filter(function(derRule) {return derRule.ruleType === 'score'}).length < 1;
    } else {
        return true;
    }
};

    $scope.derRulesCtrlLoadedPromise.resolve();

}
]);

angular.module('systemModule').controller('NewScoreModalCtrl', ['$scope', '$uibModalInstance', 'QuickBoard', 'elt',
    function($scope, $modalInstance, quickBoard, elt)
    {

        $scope.modalQuickBoard = quickBoard;



        $scope.cancelCreate = function() {
            $modalInstance.dismiss("Cancel");
        };

        $scope.someCdesInvalid = function() {
            $scope.invalidCdeMessage = undefined;
            if (quickBoard.elts.length === 0) {
                $scope.invalidCdeMessage = "There are no CDEs in your Quick Board. Add some before you can create a rule.";
                return true;
            }
            quickBoard.elts.forEach(function(qbElt) {
                if (qbElt.tinyId === elt.tinyId) {
                    $scope.invalidCdeMessage = "You are trying to add a CDE to itself. Please edit your Quick Board."
                }
            });
            quickBoard.elts.forEach(function(qbElt) {
                if (qbElt.valueDomain.datatype === "Number") return;
                if (qbElt.valueDomain.datatype === "Value List") {
                    qbElt.valueDomain.permissibleValues.forEach(function(pv) {
                        if (isNaN(pv.permissibleValue)) {
                            $scope.invalidCdeMessage = "CDE " + qbElt.naming[0].designation +
                                " contains a Permissible Value that is not a number. It may not be added to a score.";
                        }
                    });
                } else {
                    $scope.invalidCdeMessage = "CDE " + qbElt.naming[0].designation +
                        " has a datatype other than 'Number' and may not be added to a score";
                }
            });
        };

}