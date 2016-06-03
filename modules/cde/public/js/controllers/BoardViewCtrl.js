angular.module('cdeModule').controller('BoardViewCtrl',
    ['$scope', '$routeParams', '$http', 'OrgHelpers', 'userResource', 'SearchSettings', '$uibModal', '$timeout',
        function ($scope, $routeParams, $http, OrgHelpers, userResource, SearchSettings, $modal, $timeout)
{

    $scope.module = 'cde';
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
            error(function () {
                $scope.addAlert("danger", "Board not found");
            });
    };

    $scope.unpin = function (pin) {
        $http['delete']("/pincde/" + pin._id + "/" + $scope.board._id).then(function () {
            $scope.reload();
        });
    };

    $scope.exportBoard = function () {
        $http.get('/board/' + $scope.board._id + '/0/500/?type=csv')
            .success(function (response) {
                SearchSettings.getPromise().then(function (settings) {
                    var csv = exports.getCdeCsvHeader(settings.tableViewFields);
                    response.cdes.forEach(function (ele) {
                        csv += exports.convertToCsv(exports.projectCdeForExport(ele, settings.tableViewFields));
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
                });
            });
    };

    $scope.classifyBoard = function () {
        var $modalInstance = $modal.open({
            animation: false,
            templateUrl: '/cde/public/html/classifyCdesInBoard.html',
            controller: 'AddClassificationModalCtrl',
            resolve: {
                // @TODO bad design -> refactor
                cde: function () {
                    return null;
                }
                , orgName: function () {
                    return null;
                }
                , pathArray: function () {
                    return null;
                }
                , module: function () {
                    return null;
                }
                , addClassification: function () {
                    return {
                        addClassification: function (newClassification) {
                            var _timeout = $timeout(function () {
                                $scope.addAlert("warning", "Classification task is still in progress. Please hold on.");
                            }, 3000);
                            $http({
                                method: 'post',
                                url: '/classifyBoard',
                                data: {
                                    boardId: $scope.board._id
                                    , newClassification: newClassification
                                }
                            })
                            .success(function (data, status) {
                                $timeout.cancel(_timeout);
                                if (status === 200) $scope.addAlert("success", "All Elements classified.");
                                else $scope.addAlert("danger", data.error.message);
                            }).error(function () {
                                $scope.addAlert("danger", "Unexpected error. Not Elements were classified! You may try again.");
                                $timeout.cancel(_timeout);
                            });
                            $modalInstance.close();
                        }
                    };
                }
            }
        });
    };

    $scope.reload();

}]);