angular.module('systemModule').controller('AddNewRuleCtrl', ['$scope', '$uibModalInstance', 'userOrgs', function($scope, $modalInstance, userOrgs){
    $scope.fields = [
        'stewardOrg.name'
        , 'properties.key'
        , 'valueDomain.permissibleValues.codeSystemName'
        , 'valueDomain.permissibleValues.permissibleValue'
        , 'valueDomain.permissibleValues.valueMeaningName'
        , 'valueDomain.permissibleValues.valueMeaningCode'
        , 'version'
        , 'ids.version'
        , 'ids.source'
        , 'naming.context.contextName'
        , 'valueDomain.datatype'
    ];
    $scope.userOrgs = userOrgs;
    $scope.cancel = function(){
        $modalInstance.dismiss();
    };
    $scope.saveRule = function(){
        var msg = {
            occurence: $scope.occurence
            , targetStatus: $scope.targetStatus
            , ruleName: $scope.ruleName
            , rule: {regex: $scope.regex}
            , field: $scope.field
            , id: Math.random()
            , org: $scope.org
        };
        $modalInstance.close(msg);
    };
}]);