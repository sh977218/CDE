angular.module('cdeModule').controller('BoardViewCtrl',
    ['$scope', '$routeParams', '$http', 'OrgHelpers', 'userResource', 'SearchSettings', '$uibModal', '$timeout', 'Alert',
        function ($scope, $routeParams, $http, OrgHelpers, userResource, SearchSettings, $modal, $timeout, Alert) {

            $scope.elts = [];
            $scope.currentPage = 1;

            // @TODO what is this?
            $scope.ejsPage = 'board';

            $scope.includeInQuickBoard = ["/cde/public/html/accordion/sortCdes.html"];

            $scope.setPage = function (p) {
                $scope.currentPage = p;
                $scope.reload();
            };

            $scope.reload = function () {
                $scope.accordionListStyle = "semi-transparent";
                $http.get("/board/" + $routeParams.boardId + "/" + (($scope.currentPage - 1) * 20)).success(function (response) {
                    $scope.accordionListStyle = "";
                    //$scope.cdes = [];
                    //$scope.forms = [];
                    if (response.board) {
                        $scope.board = response.board;
                        var elts = $scope[$scope.board.type + 's'] = [];
                        $scope.module = $scope.board.type;
                        $scope.setViewTypes($scope.module);
                        $scope.includeInAccordion =
                            [
                                $scope.board.type + "/public/html/accordion/boardAccordionActions.html",
                                $scope.board.type + "/public/html/accordion/addToQuickBoardActions.html"
                        ];
                        $scope.totalItems = response.totalItems;
                        $scope.numPages = $scope.totalItems / 20;
                        var pins = $scope.board.pins;
                        var respElts = response.elts;
                        pins.forEach(function (pin) {
                            var pinId = $scope.board.type==='cde'?pin.deTinyId:pin.formTinyId;
                            respElts.forEach(function (elt) {
                                pinId === respElt.tinyId
                                pins.elt = respElt;
                                elts.push(respElts);
                            });
                        });
                        elts.forEach(function (elt) {
                            elt.usedBy = OrgHelpers.getUsedBy(elt, userResource.user);
                        });
                    }
                }).error(function () {
                    $scope.addAlert("danger", "Board not found");
                });
            };

            $scope.unpin = function (pin) {
                $http['delete']("/pincde/" + pin.deTinyId + "/" + $scope.board._id).then(function () {
                    $scope.reload();
                    Alert.addAlert("success", "CDE Unpinned.");
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
                                saveAs(blob, 'BoardExport' + '.csv');  // jshint ignore:line
                                Alert.addAlert("success", "Export downloaded.");
                                $scope.feedbackClass = ["fa-download"];
                            } else {
                                Alert.addAlert("danger", "The server is busy processing similar request, please try again in a minute.");
                            }
                        });
                    });
            };

            function movePin(endPoint, pinId) {
                $http.post(endPoint, {boardId: $scope.board._id, tinyId: pinId}).success(function () {
                    Alert.addAlert("success", "Saved");
                    $scope.reload();
                }).error(function (response) {
                    Alert.addAlert("danger", response);
                    $scope.reload();
                });
            }

            $scope.moveUp = function (id) {
                movePin("/board/pin/move/up", id);
            };
            $scope.moveDown = function (id) {
                movePin("/board/pin/move/down", id);
            };
            $scope.moveTop = function (id) {
                movePin("/board/pin/move/top", id);
            };

            $scope.save = function () {
                $http.post("/board", $scope.board).success(function () {
                    Alert.addAlert("success", "Saved");
                    $scope.reload();
                }).error(function (response) {
                    Alert.addAlert("danger", response);
                    $scope.reload();
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

            $scope.createFormFromBoard = function () {
                $modal.open({
                    animation: false,
                    templateUrl: '/form/public/html/createFormFromBoard.html',
                    controller: 'CreateFormFromBoardModalCtrl',
                    resolve: {
                        board: function () {
                            return $scope.board;
                        }
                    }
                });
            };
            $scope.reload();

}]);

