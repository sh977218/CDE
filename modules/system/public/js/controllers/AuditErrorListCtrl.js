angular.module('systemModule').controller('AuditErrorListCtrl', ['$scope', '$http',
    function ($scope, $http) {

    $scope.records = [];

    var itemsPerPage = 10;

    function fetchErrors(skip, limit, cb) {
        $http.post($scope.api, {skip: skip, limit: limit, excludeOrigin: $scope.excludeFilters}).success(function (result) {
            $scope.records = result;
            if (cb) cb();
        });
    }

    $scope.gotoPage = function (page, cb) {
        fetchErrors(itemsPerPage * (page - 1), itemsPerPage, cb);
    };

    $scope.excludeFilters = [];
    $scope.addExcludeFilter = function (toAdd) {
        if (toAdd.length > 0 && $scope.excludeFilters.indexOf(toAdd) === -1) {
            $scope.excludeFilters.push(toAdd.trim());
            $scope.gotoPage($scope.currentPage);
        }
    };

    $scope.currentPage = 1;

}]);