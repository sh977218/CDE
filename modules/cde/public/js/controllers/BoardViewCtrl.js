function BoardViewCtrl($scope, $routeParams, $http) {
    $scope.setActiveMenu('MYBOARDS');

    $scope.cdes = [];
        
    $scope.$watch('currentPage', function() {
        if (!$scope.currentPage) return;
        $scope.reload();
    });

    $scope.reload = function() {
        $http.get("/board/" + $routeParams.boardId + "/" + (($scope.currentPage-1) * 20)).then(function(response) {
            $scope.cdes = [];
            if (response.data.board) {
                $scope.board = response.data.board;
                $scope.totalItems = response.data.totalItems;
                $scope.numPages = $scope.totalItems / 20;
                var pins = $scope.board.pins;
                var respCdes = response.data.cdes;
                for (var i = 0; i < pins.length; i++) {
                    for (var j = 0; j < respCdes.length; j++) {
                        if (pins[i].deUuid === respCdes[j].uuid) {
                            pins[i].cde = respCdes[j];                    
                            $scope.cdes.push(respCdes[j]);
                        }
                    }
                }
            } else {
                $scope.addAlert("danger", "Board not found");
            }
        });
    }; 
        
    $scope.unpin = function(pin) {
        $http['delete']("/pincde/" + pin._id + "/" + $scope.board._id).then(function(response) {
            $scope.reload();
        });
    };
    
    $scope.reload();
    
}
