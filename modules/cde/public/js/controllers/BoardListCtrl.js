angular.module('cdeModule').controller('BoardListCtrl', ['$scope', 'ElasticBoard', '$http', function($scope, ElasticBoard, $http) {
    $scope.search = {name: ""};
    $scope.boards = [];
    $scope.reload = function() {
        ElasticBoard.basicSearch({q: $scope.search.name}, function(response){
            $scope.boards = response.hits.hits.map(function(b){return b._source;});
        });
    };
}
]);