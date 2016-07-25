angular.module('systemModule').controller('SaveValidRuleCtrl', ['$scope', 'OrgHelpers', 'Organization', '$http', '$uibModal',
    function ($scope, OrgHelpers, Organization, $http, $modal) {
        $scope.userOrgs = {};
        $scope.myOrgs.forEach(function(orgName){
            Organization.getByName(orgName, function(o){
                $scope.userOrgs[orgName] = o.data.cdeStatusValidationRules;
            });
        });
        console.log($scope.userOrgs);
        $scope.removeRule = function(o, i){
            var key = $scope.userOrgs[o][i].field.replace(/[^\w]/g,"")+$scope.userOrgs[o][i].rule.regex.replace(/[^\w]/g,"");
            $http.post('/removeRule', {orgName:o, rule: key}, function(response){
                console.log(response.data);
                console.log('removed');
            });
        };

        $scope.ruleEnabled = function(orgName, rule){
            var ruleIds = $scope.userOrgs[orgName].map(function(rule){return rule.id});
            return ruleIds.indexOf(rule.id) > -1;
        };


        $scope.disableRule = function(orgName, rule){
            var modalInstance = $modal.open({
                //animation: false,
                templateUrl: '/system/public/html/statusRules/removeRule.html',
                controller: 'RemoveRuleCtrl'
            });
            modalInstance.result.then(function () {
                $http.post("/disableRule", {orgName: orgName, rule: rule}).then(function(response){
                    $scope.userOrgs[orgName] = response.data.cdeStatusValidationRules;
                });
            }, function(reason) {

            });

        };
        $scope.enableRule = function(orgName, rule){
            $http.post("/enableRule", {orgName: orgName, rule: rule}).then(function(response){
                $scope.userOrgs[orgName] = response.data.cdeStatusValidationRules;
            });
        };

        $scope.openAddRuleModal = function(){
            var modalInstance = $modal.open({
                animation: false,
                templateUrl: '/system/public/html/statusRules/addNewRule.html',
                controller: 'AddNewRuleCtrl',
                resolve: {
                    myOrgs: function(){return $scope.myOrgs}
                }
            });
            modalInstance.result.then(function (rule) {
                $scope.enableRule(rule.org, rule);
            }, function(reason) {

            });
        };
    }]);