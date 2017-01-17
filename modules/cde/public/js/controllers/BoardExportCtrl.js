angular.module('cdeModule').controller('BoardExportCtrl',
    ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams)
{

    $http.get("/board/" + $routeParams.boardId + "/0/500").then(function onSuccess(response) {
        if (response.data.board) {
            $scope.board = response.data.board;
            var pins = $scope.board.pins;
            var respCdes = response.data.cdes;
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
    }).catch(function onError(response) {
        if (response.status === 404)
            $scope.addAlert("danger", "Board not found");
        if (response.status === 403)
            $scope.addAlert("danger", "Board too large");
    });
}
]);