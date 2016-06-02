angular.module('cdeModule').controller('RegStatusValidationCtrl', ['$scope', 'OrgHelpers',
    function($scope, OrgHelpers)
    {

        $scope.getOrgRulesForCde = function(cde){
            var result = {};
            cde.classification.forEach(function(org){
                result[org.stewardOrg.name] = OrgHelpers.getStatusValidationRules(org.stewardOrg.name);
            });
            return result;
        };

        $scope.cdeOrgRules = $scope.getOrgRulesForCde($scope.elt);

        $scope.cdePassingRule = function(cde, rule){
            return false;
        };
    }]);