angular.module('cdeModule').controller('RegStatusValidationCtrl', ['$scope', 'OrgHelpers', 'RegStatusValidator',
    function($scope, OrgHelpers, RegStatusValidator)
    {



        $scope.getOrgRulesForCde = RegStatusValidator.getOrgRulesForCde;

        $scope.cdeOrgRules = $scope.getOrgRulesForCde($scope.elt);

            var cdeStatusRules = {
                Incomplete: {},
                Candidate: {},
                Recorded: {},
                Qualified: {},
                Standard: {},
                "Preferred Standard": {}
            };

            Object.keys($scope.cdeOrgRules).forEach(function (orgName) {
                $scope.cdeOrgRules[orgName].forEach(function (rule) {
                    if (!cdeStatusRules[rule.targetStatus][orgName]) cdeStatusRules[rule.targetStatus][orgName] = [];
                    cdeStatusRules[rule.targetStatus][orgName].push(rule);
                });
            });


            $scope.cdeStatusRules = cdeStatusRules;
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

            $scope.conditionsMetForStatusWithinOrg = RegStatusValidator.conditionsMetForStatusWithinOrg;

            $scope.showStatus = function (status) {
                return Object.keys(status).length > 0;
            };

    }]);