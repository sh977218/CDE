angular.module('cdeModule').controller('BoardListCtrl', ['$scope', '$http', 'ElasticBoard', function ($scope, $http, ElasticBoard) {

    $scope.$watch(function () {
        return $scope.filter.search;
    }, function (newValue, oldValue) {
        if (oldValue !== newValue) {
            $scope.message = '';
        }
    });
    $scope.boards = [];
    $scope.filter = {
        search: "",
        selectedTags: [],
        selectedShareStatus: ['Public'],
        sortBy: 'name',
        sortDirection: 'asc',
        tags: []
    };
    $scope.loadPublicBoards = function () {
        if ($scope.filter.search.length > 0) {
            ElasticBoard.basicSearch($scope.filter, function (response) {
                if (response.hits.hits.length === 0) {
                    $scope.message = 'No board(s) found with search: ' + $scope.filter.search;
                }
                $scope.boards = response.hits.hits.map(function (h) {
                    h._source._id = h._id;
                    return h._source;
                });
                $scope.filter.tags = response.aggregations.aggregationsName.buckets;
            });
        } else {
            $scope.message = '';
        }
    };

    $scope.canEditBoard = function () {
        return false;
    };
}
]);