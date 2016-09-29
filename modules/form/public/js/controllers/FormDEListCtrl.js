angular.module('formModule').controller('FormDEListCtrl', ['$scope', function($scope)
{
    $scope.embedded = true;

    $scope.reset = function (type) {
        $scope.initSearch();
        $scope.reload(type);
    };

    $scope.termSearch = function () {
        $scope.reload();
    };

    $scope.pageChange = function() {
        $scope.reload();
    };

    $scope.selectElement = function(e) {
        $scope._selectElement(e);
        $scope.reload();
    };

    $scope.addStatusFilter = function(status) {
        var index = $scope.searchSettings.regStatuses.indexOf(status);
        if (index > -1) $scope.searchSettings.regStatuses.splice(index, 1);
        else $scope.searchSettings.regStatuses.push(status);
        $scope.reload();
    };

    $scope.alterOrgFilter = function(orgName) {
        $scope._alterOrgFiler(orgName);
        $scope.reload();
    };

}]);

angular.module('formModule').controller('FormFormListCtrl', ['$scope', '$controller', function($scope, $controller)
{

    $controller('FormDEListCtrl', {$scope: $scope});

    $scope.termSearch = function () {
        $scope.reload("form");
    };

}]);
