angular.module('systemModule').controller('AuditErrorListCtrl', ['$scope', '$http', '$uibModal',
    function ($scope, $http, $modal) {

    $scope.records = [];

        $scope.itemsPerPage = 50;

    function fetchErrors(skip, limit, cb) {
        $http.post($scope.api, {
            skip: skip,
            limit: limit,
            excludeOrigin: $scope.excludeFilters
        }).then(function onSuccess(response) {
            $scope.records = response.data;
            if (cb) cb();
        });
    }

    $scope.gotoPage = function (page, cb) {
        fetchErrors($scope.itemsPerPage * (page - 1), $scope.itemsPerPage, cb);
    };

    $scope.excludeFilters = [];
    $scope.addExcludeFilter = function (toAdd) {
        if (toAdd.length > 0 && $scope.excludeFilters.indexOf(toAdd) === -1) {
            $scope.excludeFilters.push(toAdd.trim());
            $scope.gotoPage($scope.currentPage);
        }
    };

    $scope.currentPage = 1;

        $scope.openErrorDetail = function (error) {
            $modal.open({
                animation: false,
                templateUrl: '/system/public/html/errorDetail.html',
                size: 'lg',
                resolve: {
                    Error: function () {
                        return error;
                    },
                    ErrorDetailFields: function () {
                        return $scope.errorDetailFields;
                    }
                },
                controller: 'ErrorDetailCtrl'
            }).result.then(function () {
            });
        }
}]);


angular.module("systemModule").controller('ErrorDetailCtrl', ['$scope', 'Error', 'ErrorDetailFields', function ($scope, Error, ErrorDetailFields) {
    $scope.error = Error;
    $scope.errorDetailFields = ErrorDetailFields;
}]);
