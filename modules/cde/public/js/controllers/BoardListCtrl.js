angular.module('cdeModule').controller('BoardListCtrl', ['$scope', 'BoardSearch', '$http', function($scope, BoardSearch, $http) {
    $scope.search = {name: ""};
    $scope.currentPage = 1;
    $scope.pageSize = 10;

    $scope.boards = [];

    $scope.reload = function() {
        var newfrom = ($scope.currentPage - 1) * $scope.pageSize;
        var result = BoardSearch.get({from: newfrom, search: JSON.stringify($scope.search)}, function () {
           $scope.numPages = result.pages; 
           $scope.boards = result.boards;
           $scope.totalItems = result.totalNumber;

            //var tinyIds = [];
            //result.boards.forEach(function(b){
            //    b.pins.forEach(function(p){
            //        tinyIds.push(p.deTinyId);
            //    });
            //});
            //
            //$http.post('/cdesByTinyIdList', tinyIds).then(function(response){
            //    console.log(response.data);
            //});
        });
    } ;  
    
}
]);