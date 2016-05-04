angular.module('cdeModule').controller('BoardListCtrl', ['$scope', 'ElasticBoard', '$http', function ($scope, ElasticBoard) {
    $scope.search = {name: ""};
    $scope.boards = [];
    $scope.reload = function () {
        ElasticBoard.basicSearch({q: $scope.search.name}, function (response) {
            $scope.boards = response.hits.hits.map(function (b) {
                b._source._id = b._id;
                return b._source;
            });
        });
    };
}
]);