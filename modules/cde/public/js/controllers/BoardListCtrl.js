angular.module('cdeModule').controller('BoardListCtrl', ['$scope', 'ElasticBoard', '$http', function($scope, ElasticBoard, $http) {
    $scope.search = {name: ""};
    $scope.currentPage = 1;
    $scope.pageSize = 10;

    $scope.boards = [];

    $scope.reload = function() {
        var newfrom = ($scope.currentPage - 1) * $scope.pageSize;
        //var result = BoardSearch.get({from: newfrom, search: JSON.stringify($scope.search)}, function () {
        //   $scope.numPages = result.pages;
        //   $scope.boards = result.boards;
        //   $scope.totalItems = result.totalNumber;
        //});

        ElasticBoard.basicSearch({q: $scope.search.name}, function(response){
            console.log(response);

            $scope.boards = response.hits.hits.map(function(b){return b._source;});
        });

    } ;  
    
}
]);