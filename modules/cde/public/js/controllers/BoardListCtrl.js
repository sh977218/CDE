angular.module('cdeModule').controller('BoardListCtrl', ['$scope', '$http', 'ElasticBoard', function ($scope, $http, ElasticBoard) {
    $scope.search = {name: ""};
    $scope.boards = [];
    $scope.selectedTags = [];
    $scope.reload = function () {
        ElasticBoard.basicSearch({q: $scope.search.name}, function (response) {
            $scope.publicBoardTags = response.aggregations.aggregationsName.buckets;
            $scope.boards = response.hits.hits.map(function (b) {
                b._source._id = b._id;
                return b._source;
            });
        });
    };
    $scope.updatePublicBoardWithTags = function () {
        ElasticBoard.basicSearch({q: $scope.search.name, tags: $scope.selectedTags}, function (response) {
            $scope.publicBoardTags = response.aggregations.aggregationsName.buckets;
            $scope.boards = response.hits.hits.map(function (b) {
                b._source._id = b._id;
                return b._source;
            });
        });
    }
}
]);