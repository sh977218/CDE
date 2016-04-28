angular.module('systemModule').controller('AuditErrorListCtrl', ['$scope', '$http', // jshint ignore:line
    function ($scope, $http) {

    $scope.records = [];

    var itemsPerPage = 10;

    function fetchErrors(skip, limit, cb) {
        $http.post($scope.api, {skip: skip, limit: limit, exclude: []}).success(function (result) {
            $scope.records = result;
            if (cb) cb();
        });
    }

    $scope.gotoPage = function (page, cb) {
        $scope.fetchErrors(itemsPerPage * (page - 1), itemsPerPage, cb);
    };

    $scope.excludeFilters = [];
    $scope.addExcludeFilter = function (toAdd) {
        if (toAdd.length > 0) {
            $scope.excludeFilters.push(toAdd);
            $scope.f
        }
    };

    $scope.currentPage = 1;

}]);