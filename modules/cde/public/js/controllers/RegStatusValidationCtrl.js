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

                }
            }
            return checkSubTree(cde, rule, 0);
        };

        //$scope.cdePassingRule = function(object, rule){
        //    var fields = rule.field.split(".");
        //
        //    var obj = object;
        //    var failed = false;
        //    fields.forEach(function(f){
        //        if (failed) return;
        //        if (!obj[f]) {
        //            failed = true;
        //            return;
        //        } else {
        //            obj = obj[f]
        //        }
        //    });
        //    if (!Array.isArray(obj)) {
        //        return !failed;
        //    } else {
        //        if (rule.occurence === "all") {
        //            var result = true;
        //            obj.forEach(function (subTree) {
        //                result = result && $scope.cdePassingRule(subTree, rule);
        //            });
        //            return result;
        //        }
        //
        //        if (rule.occurence === "atLeastOne") {
        //            var result = false;
        //            obj.forEach(function (subTree) {
        //                result = result || $scope.cdePassingRule(subTree, rule);
        //            });
        //            return result;
        //        }
        //    }
        //
        //};
    }]);