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


        var cdeOrgRules = $scope.getOrgRulesForCde($scope.elt);

        var cdePassingRule = function(cde, rule){
            function checkRe(field, rule){
                var re = new RegExp(rule.rule.regex);
                return re.test(field);
            }
            function checkSubTree(object, rule, level){
                var key = rule.field.split(".")[level];
                if (!object[key]) return false;
                if (level === rule.field.split(".").length-1) return checkRe(object[key], rule);
                if (!Array.isArray(object[key])) return checkSubTree(object[key], rule, level+1);
                if (Array.isArray(object[key])) {
                    if (rule.occurence === "atLeastOne") {
                        var result = false;
                        object[key].forEach(function(subTree){
                            result = result || checkSubTree(subTree, rule, level+1);
                        });
                        return result;
                    }
                    if (rule.occurence === "all") {
                        var result = true;
                        object[key].forEach(function(subTree){
                            result = result && checkSubTree(subTree, rule, level+1);
                        });
                        return result;
                    }
                }
            }
            return checkSubTree(cde, rule, 0);
        };

        $scope.cdePassingRule = cdePassingRule;

        $scope.sortRulesByStatus = function(rule) {
            var map = {'Preferred Standard':5, Standard: 4, Qualified: 3, Recorded: 2, Candidate: 1, Incomplete: 0};
            return map[rule.targetStatus];
        };

        var conditionsMetForStatusWithinOrg = function(cde, orgName, status){
            var orgRules = cdeOrgRules[orgName];
            var rules = orgRules.filter(function(r){
                var s = r.targetStatus;
                if (status==='Incomplete') return s === 'Incomplete';
                if (status==='Candidate') return s === 'Incomplete' || s === 'Candidate';
                if (status==='Recorded') return s === 'Incomplete' || s === 'Candidate' || s === 'Recorded';
                if (status==='Qualified') return s === 'Incomplete' || s === 'Candidate' || s === 'Recorded' || s === 'Qualified';
                if (status==='Standard') return s === 'Incomplete' || s === 'Candidate' || s === 'Recorded' || s === 'Qualified' || s === 'Standard';
                return true;
            });
            if (rules.length==0) return true;
            var results = rules.map(function(r){
                return cdePassingRule(cde, r);
            });
            return results.every(function(x){return x});
        };

        $scope.conditionsMetForStatusWithinOrg = conditionsMetForStatusWithinOrg;

        console.log($scope.conditionsMetForStatusWithinOrg($scope.elt, 'TEST', 'Incomplete'));
        console.log($scope.conditionsMetForStatusWithinOrg($scope.elt, 'TEST', 'Qualified'));
        console.log($scope.conditionsMetForStatusWithinOrg($scope.elt, 'TEST', 'Recorded'));
        console.log($scope.conditionsMetForStatusWithinOrg($scope.elt, 'TEST', 'Candidate'));

    }]);