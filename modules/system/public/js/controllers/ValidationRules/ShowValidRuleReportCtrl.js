angular.module('systemModule').controller('ShowValidRuleReportCtrl', ['$scope', '$routeParams', 'OrgHelpers',
    function ($scope, $routeParams, OrgHelpers) {
        $routeParams.searchSettings  = JSON.parse($routeParams.searchSettings);
        $scope.gridOptionsReport = {
            columnDefs: [{field: "cdeName", displayName: "CDE Name"}, {field: 'tinyId', displayName: "NLM ID"}]
        };
        $routeParams.cb = function(cdes){
            if (cdes.length === 0) {
                $scope.cdes = [];
                return;
            }
            cdes[0].validationRules.forEach(function(r, i){
                $scope.gridOptionsReport.columnDefs.push({field: 'rule' + i, displayName: r.ruleName});
            });
            $scope.cdes = cdes.map(function(cde){
                var output = {cdeName: cde.cdeName, tinyId: cde.tinyId};
                cde.validationRules.forEach(function(rule, i){
                    output['rule' + i] = rule.cdePassingRule?"Yes":"No";
                });
                return output;
            });
            $scope.cdes.length = 100;
        };
        $scope.module = 'cde';
        OrgHelpers.deferred.promise.then(function() {
            $scope.exportSearchResults('validationRules', $routeParams);
        });

    }]);

angular.module('systemModule').controller('ValidRuleExpCtrl', ['$scope', '$uibModalInstance',
    function ($scope, $modalInstance) {
        $scope.status = "Incomplete";
        $scope.export = function(){
            $modalInstance.close({status: $scope.status, org: $scope.selectedOrg});
        };
        $scope.close = function(){
            $modalInstance.dismiss();
        };
    }]);


angular.module('systemModule').controller('RemoveRuleCtrl', ['$scope', '$uibModalInstance', function($scope, $modalInstance){
    $scope.cancel = function(){
        $modalInstance.dismiss();
    };
    $scope.deleteRule = function(){
        $modalInstance.close();
    };
}]);