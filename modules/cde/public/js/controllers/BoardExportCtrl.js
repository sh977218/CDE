angular.module('cdeModule').controller('BoardExportCtrl', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams) {

    $http.get("/board/" + $routeParams.boardId + "/0/500").
        success(function(response) {
            if (response.board) {
                $scope.board = response.board;
                var pins = $scope.board.pins;
                var respCdes = response.cdes;
                for (var i = 0; i < pins.length; i++) {
                    for (var j = 0; j < respCdes.length; j++) {
                        if (pins[i].deTinyId === respCdes[j].tinyId) {
                            pins[i].cde = respCdes[j];
                            $scope.gridCdes.push($scope.cdeToExportCde(respCdes[j]));
                        }
                    }
                }
                if ($scope.gridCdes.length === 500) {
                    $scope.addAlert("info", "limit of 500 documents returned");
                }
            }
        }).
        error(function(response) {
            if (response.statusCode === 404)
                $scope.addAlert("danger", "Board not found");
            if (response.statusCode === 403)
                $scope.addAlert("danger", "Board too large");
        });


}
]);