angular.module('cdeModule').controller('BoardViewCtrl', ['$scope', '$routeParams', '$http', 'OrgHelpers', 'userResource', function ($scope, $routeParams, $http, OrgHelpers, userResource) {
    $scope.cdes = [];

    $scope.includeInAccordion = ["/cde/public/html/accordion/boardAccordionActions.html",
        "/cde/public/html/accordion/addToQuickBoardActions.html" ];

    $scope.setPage = function (p) {
        $scope.currentPage = p;
        $scope.reload();
    };

    $scope.reload = function () {
        $scope.accordionListStyle = "semi-transparent";
        $http.get("/board/" + $routeParams.boardId + "/" + (($scope.currentPage - 1) * 20)).
            success(function (response) {
                $scope.accordionListStyle = "";
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
                    $scope.cdes.forEach(function (elt) {
                        elt.usedBy = OrgHelpers.getUsedBy(elt, userResource.user);
                    });
                }
            }).
            error(function (response) {
                $scope.addAlert("danger", "Board not found");
            });
    };

    $scope.unpin = function (pin) {
        $http['delete']("/pincde/" + pin._id + "/" + $scope.board._id).then(function (response) {
            $scope.reload();
        });
    };

    $scope.exportBoard = function () {
        $http.get('/board/' + $scope.board._id + '/0/500')
            .success(function (response) {
                var csv = exports.exportHeader.cdeHeader;
                response.cdes.forEach(function (ele) {
                    csv += exports.convertToCsv(exports.projectCdeForExport(ele));
                });
                if (csv) {
                    var blob = new Blob([csv], {
                        type: "text/csv"
                    });
                    saveAs(blob, 'BoardExport' + '.csv');
                    $scope.addAlert("success", "Export downloaded.");
                    $scope.feedbackClass = ["fa-download"];
                } else {
                    $scope.addAlert("danger", "The server is busy processing similar request, please try again in a minute.");
                }
            })
            .error(function (data, status, headers, config) {
            })
    };


    $scope.reload();

}]);