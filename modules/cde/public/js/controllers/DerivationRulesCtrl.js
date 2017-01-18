angular.module('cdeModule').controller('DerivationRulesCtrl', ['$scope', '$uibModal', 'QuickBoard', 'CdeList', '$http',
    function($scope, $modal, quickBoard, CdeList, $http)
{

    var updateRules = function() {
        if ($scope.elt.derivationRules) {
            $scope.elt.derivationRules.forEach(function(dr) {
                if (dr.inputs[0] !== null) {
                    CdeList.byTinyIdList(dr.inputs, function(result) {
                        dr.fullCdes = result;
                        //dr.cdeNamesAsString = result.map(function(r) {return r.naming[0].designation}).join(' , ');
                    });
                }
            });
        }
    };

    $scope.deferredEltLoaded.promise.then(updateRules);

    var findDerivationOutputs = function() {
        if (!$scope.elt.derivationOutputs) {
            $scope.elt.derivationOutputs = [];
            $http.get("/cde/derivationOutputs/" + $scope.elt.tinyId).then(function(result){
                result.data.forEach(function(outputCde) {
                    outputCde.derivationRules.forEach(function(derRule) {
                        if (derRule.inputs.indexOf($scope.elt.tinyId) > -1) {
                            $scope.elt.derivationOutputs.push({ruleName: derRule.name, cde: outputCde});
                        }
                    });
                });
            });
        }
    };

    $scope.$on('elementReloaded', function() {
        updateRules();
        if ($scope.tabs.derivationRules.active) {
            findDerivationOutputs();
        }
    });

    $scope.$on('loadDerivationRules', findDerivationOutputs);

    $scope.openNewScore = function () {
        $modal.open({
            animation: false,
            templateUrl: 'newScoreModalContent.html',
            controller: 'NewScoreModalCtrl',
            resolve: {
                elt: function() {return $scope.elt;}
            }
        }).result.then(function (newDerivationRule) {
            if (!$scope.elt.derivationRules) $scope.elt.derivationRules = [];
            quickBoard.elts.forEach(function(qbElt) {
                newDerivationRule.inputs.push(qbElt.tinyId);
            });
            $scope.elt.derivationRules.push(newDerivationRule);
            $scope.stageElt($scope.elt);
            updateRules();
        }, function () {});
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

    $scope.newDerivationRule = {
        ruleType: "score",
        formula: "sumAll",
        inputs: []
    };

    $scope.okCreate = function () {
        $modalInstance.close($scope.newDerivationRule);
    };

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
        if ($scope.invalidCdeMessage) return;
    };

}]);
