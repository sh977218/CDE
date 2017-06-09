angular.module('cdeModule').controller('BoardListCtrl', ['$scope', '$http', 'ElasticBoard', 'AlertService',
    function ($scope, $http, ElasticBoard, Alert) {

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
        ElasticBoard.basicSearch($scope.filter, function (err, response) {
            if (err) Alert.addAlert("danger", "An error occured");
            $scope.boards = response.hits.hits.map(function (h) {
                h._source._id = h._id;
                return h._source;
            });
            $scope.filter.tags = response.aggregations.aggregationsName.buckets;
        });
    };

    $scope.canEditBoard = function () {
        return false;
    };
}
]);