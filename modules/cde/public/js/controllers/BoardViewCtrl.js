function BoardViewCtrl($scope, $routeParams, $http) {
    $scope.cdes = [];
        
    $scope.$watch('currentPage', function() {
        if (!$scope.currentPage) return;
        $scope.reload();
    });

    $scope.reload = function() {
        $http.get("/board/" + $routeParams.boardId + "/" + (($scope.currentPage-1) * 20)).
            success(function(response) {
                $scope.cdes = [];
                if (response.board) {
                    $scope.board = response.board;
                    $scope.totalItems = response.totalItems;
                    $scope.numPages = $scope.totalItems / 20;
                    var pins = $scope.board.pins;
                    var respCdes = response.cdes;
                    for (var i = 0; i < pins.length; i++) {
                        for (var j = 0; j < respCdes.length; j++) {
                            if (pins[i].deTinyId === respCdes[j].tinyId) {
                                pins[i].cde = respCdes[j];  
                                $scope.cdes.push(respCdes[j]);
                            }
                        }
                    }
                }
            }).
            error(function(response) {
                if (response.statusCode === 404)
                    $scope.addAlert("danger", "Board not found");
                if (response.statusCode === 403)
                    $scope.addAlert("danger", "Board too large");
            });
    };
        
    $scope.unpin = function(pin) {
        $http['delete']("/pincde/" + pin._id + "/" + $scope.board._id).then(function(response) {
            $scope.reload();
        });
    };
    
    $scope.reload();
    
}
