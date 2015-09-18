angular.module('cdeModule').controller('DerivationRulesCtrl', ['$scope', '$modal', 'QuickBoard', 'CdeList',
    function($scope, $modal, quickboard, CdeList)
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

    $scope.cdeLoadedPromise.then(function() {updateRules();});

    $scope.$on('dataElementReloaded', function() {
        updateRules();
    });

    $scope.openDerivationRule = function () {
        var modalInstance = $modal.open({
            templateUrl: 'newDerivationRuleModalContent.html',
            controller: 'NewDerivationRulesModalCtrl',
            resolve: {
            }
        });

        modalInstance.result.then(function (newDerivationRule) {
            if (!$scope.elt.derivationRules) $scope.elt.derivationRules = [];
            quickboard.elts.forEach(function(qbElt) {
                newDerivationRule.inputs.push(qbElt.tinyId);
            });
            $scope.elt.derivationRules.push(newDerivationRule);
            $scope.stageElt($scope.elt);
            updateRules();
        });
    };

    $scope.removeDerivationRule = function (index) {
        $scope.elt.derivationRules.splice(index, 1);
        $scope.stageElt($scope.elt);
    };

}
]);

angular.module('systemModule').controller('NewDerivationRulesModalCtrl', ['$scope', '$modalInstance',
    function($scope, $modalInstance)
{
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
}]);
