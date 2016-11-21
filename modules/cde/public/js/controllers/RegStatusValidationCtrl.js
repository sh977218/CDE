angular.module('cdeModule').controller('RegStatusValidationCtrl', ['$scope', 'OrgHelpers', 'RegStatusValidator',
    function($scope, OrgHelpers, RegStatusValidator)
    {

        var getOrgRulesForCde = RegStatusValidator.getOrgRulesForCde;
        var cdeOrgRules = getOrgRulesForCde($scope.elt);
        $scope.cdeStatusRules = RegStatusValidator.getStatusRules(cdeOrgRules);
        $scope.cdePassingRule = RegStatusValidator.cdePassingRule;

        $scope.sortRulesByStatus = function (rule) {
            var map = {
                'Preferred Standard': 5,
                Standard: 4,
                Qualified: 3,
                Recorded: 2,
                Candidate: 1,
                Incomplete: 0
            };
            return map[rule.targetStatus];
        };

        $scope.showStatus = function (status) {
            return Object.keys(status).length > 0;
        };
        $scope.hasRules = function () {
            return Object.keys($scope.cdeStatusRules).length > 0;
        };

    }]);