angular.module('systemModule').controller('ClassificationManagementCtrl',
    ['$scope', '$http', '$q','$uibModal', 'OrgClassification', '$timeout', 'Elastic', 'userResource', 'SearchSettings', '$log', 'AlertService',
        function($scope, $http, $q, $modal, OrgClassification, $timeout, Elastic, userResource, SearchSettings, $log, Alert)
{

    $scope.module = "cde";
    $scope.classifSubEltPage = '/system/public/html/classif-elt-mgt.html';

    userResource.getPromise().then(function(){
        if (userResource.userOrgs.length > 0)  {
            $scope.orgToManage = userResource.userOrgs[0];
            $scope.userOrgs = userResource.userOrgs;
        }
    });

    $scope.org = {};

    $scope.classificationToFilter = function() {
        return $scope.org.classifications;
    };

}]);

angular.module("systemModule").controller('ClassLeafCtrl', ['$scope', function($scope){
    var j = JSON.parse(JSON.stringify($scope.pathArray));
    j.push($scope.elt.name);
    $scope.pathArray = j;
}]);
