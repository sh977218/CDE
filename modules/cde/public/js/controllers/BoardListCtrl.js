angular.module('cdeModule').controller('BoardListCtrl', ['$scope', 'ElasticBoard', '$http', function ($scope, $http, ElasticBoard) {
    $scope.search = {name: ""};
    $scope.boards = [];
    $scope.selectedTags = [];
    $scope.reload = function () {
        ElasticBoard.basicSearch({q: $scope.search.name}, function (response) {
            $scope.publicBoardTags = response;
            $scope.boards = response.hits.hits.map(function (b) {
                b._source._id = b._id;
                return b._source;
            });
        });
    };
}
]);