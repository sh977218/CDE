angular.module('cdeModule').controller('BoardListCtrl', ['$scope', '$http', 'ElasticBoard', function ($scope, $http, ElasticBoard) {
    $scope.boards = [];
    $scope.filter = {
        search: "",
        selectedTags: [],
        tags: []
    };
    $scope.loadPublicBoards = function () {
        ElasticBoard.basicSearch($scope.filter, function (response) {
            $scope.boards = response.hits.hits.map(function (h) {
                h._source._id = h._id;
                return h._source;
            });
            $scope.filter.tags = response.aggregations.aggregationsName.buckets;
        });
    };
}
]);