angular.module('systemModule').controller('SaveValidRuleCtrl', ['$scope', 'OrgHelpers', 'Organization', '$http', '$uibModal',
    function ($scope, OrgHelpers, Organization, $http, $modal) {
        $scope.userOrgs = {};

        OrgHelpers.deferred.promise.then(function() {
            Object.keys(OrgHelpers.orgsDetailedInfo).forEach(function (orgName) {
                $scope.userOrgs[orgName] = OrgHelpers.orgsDetailedInfo[orgName].cdeStatusValidationRules;
            });
        });
        $scope.removeRule = function(o, i){
            var key = $scope.userOrgs[o][i].field.replace(/[^\w]/g,"")+$scope.userOrgs[o][i].rule.regex.replace(/[^\w]/g,"");
            $http.post('/removeRule', {orgName:o, rule: key}, function(){
            });
        };

        $scope.ruleEnabled = function(orgName, rule){
            var ruleIds = $scope.userOrgs[orgName].map(function(rule){return rule.id;});
            return ruleIds.indexOf(rule.id) > -1;
        };


        $scope.disableRule = function(orgName, rule){
            $modal.open({
                templateUrl: '/system/public/html/statusRules/removeRule.html',
                controller: function () {}
            }).result.then(function () {
                $http.post("/disableRule", {orgName: orgName, rule: rule}).then(function(response){
                    $scope.userOrgs[orgName] = response.data.cdeStatusValidationRules;
                });
            }, function () {});

        };
        $scope.enableRule = function(orgName, rule){
            $http.post("/enableRule", {orgName: orgName, rule: rule}).then(function onSuccess(response){
                $scope.userOrgs[orgName] = response.data.cdeStatusValidationRules;
            }).catch(function onError() {});
        };

        $scope.openAddRuleModal = function(){
            $modal.open({
                animation: false,
                templateUrl: '/system/public/html/statusRules/addNewRule.html',
                controller: 'AddNewRuleCtrl',
                resolve: {
                    userOrgs: function(){return $scope.userOrgs;}
                }
            }).result.then(function (rule) {
                $scope.enableRule(rule.org, rule);
            }, function () {});
        };
    }]);