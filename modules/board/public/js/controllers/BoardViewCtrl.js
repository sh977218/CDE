angular.module('cdeModule').controller('BoardViewCtrl',
    ['$scope', '$routeParams', '$http', 'OrgHelpers', 'userResource', 'SearchSettings', '$uibModal', '$timeout', 'Alert', '$q',
        function ($scope, $routeParams, $http, OrgHelpers, userResource, SearchSettings, $modal, $timeout, Alert, $q) {

            $scope.elts = [];
            $scope.currentPage = 1;

            // @TODO what is this?
            $scope.ejsPage = 'board';

            $scope.includeInQuickBoard = ["/cde/public/html/accordion/sortCdes.html"];

            $scope.setPage = function (p) {
                $scope.currentPage = p;
                $scope.reload();
            };

            $scope.switchCommentMode = function () {
                $scope.commentMode = !$scope.commentMode;
            };

            $scope.getEltId = function () {
                return $scope.board._id;
            };
            $scope.getEltName = function () {
                return $scope.board.name;
            };
            $scope.getCtrlType = function () {
                return "board";
            };
            $scope.doesUserOwnElt = function () {
                return userResource.user.siteAdmin || (userResource.user.username === $scope.board.owner.username);
            };

            $scope.deferredEltLoaded = $q.defer();

            $scope.reload = function () {
                $scope.accordionListStyle = "semi-transparent";
                $http.get("/board/" + $routeParams.boardId + "/" + (($scope.currentPage - 1) * 20)).then(function onSuccess(response) {
                    $scope.accordionListStyle = "";
                    if (response.data.board) {
                        $scope.board = response.data.board;
                        var elts = $scope[$scope.board.type + 's'] = [];
                        $scope.module = $scope.board.type;
                        $scope.setViewTypes($scope.module);
                        $scope.includeInAccordion =
                            [
                                "/system/public/html/accordion/boardAccordionActions.html",
                                "/system/public/html/accordion/addToQuickBoardActions.html"
                            ];
                        $scope.totalItems = response.data.totalItems;
                        $scope.numPages = $scope.totalItems / 20;
                        var pins = $scope.board.pins;
                        var respElts = response.data.elts;
                        pins.forEach(function (pin) {
                            var pinId = $scope.board.type === 'cde' ? pin.deTinyId : pin.formTinyId;
                            respElts.forEach(function (elt) {
                                if (pinId === elt.tinyId) {
                                    pins.elt = elt;
                                    elts.push(elt);
                                }
                            });
                        });
                        elts.forEach(function (elt) {
                            elt.usedBy = OrgHelpers.getUsedBy(elt, userResource.user);
                        });
                        $scope.board.users.filter(function (u) {
                            if (u.lastViewed) u.lastViewedLocal = new Date(u.lastViewed).toLocaleDateString();
                            if (u.username === userResource.user.username) {
                                $scope.boardStatus = u.status.approval;
                            }
                        });
                        $scope.deferredEltLoaded.resolve();
                    }
                }).catch(function onError() {
                    $scope.addAlert("danger", "Board not found");
                });
            };

            $scope.unpin = function (pin) {
                var url;
                if (pin.deTinyId) {
                    url = "/pin/cde/" + pin.deTinyId + "/" + $scope.board._id;
                } else if (pin.formTinyId) {
                    url = "/pin/form/" + pin.formTinyId + "/" + $scope.board._id;
                }
                $http['delete'](url).then(function onSuccess() {
                    $scope.reload();
                    Alert.addAlert("success", "Unpinned.");
                }).catch(function onError() {});
            };

            $scope.exportBoard = function () {
                $http.get('/board/' + $scope.board._id + '/0/500/?type=csv')
                    .then(function onSuccess(response) {
                        SearchSettings.getPromise().then(function (settings) {
                            var csv = exports.getCdeCsvHeader(settings.tableViewFields);
                            response.data.elts.forEach(function (ele) {
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
                $http.post(endPoint, {boardId: $scope.board._id, tinyId: pinId}).then(function onSuccess() {
                    Alert.addAlert("success", "Saved");
                    $scope.reload();
                }).catch(function onError(response) {
                    Alert.addAlert("danger", response.data);
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
                $http.post("/board", $scope.board).then(function onSuccess() {
                    Alert.addAlert("success", "Saved");
                    $scope.reload();
                }).catch(function onError(response) {
                    Alert.addAlert("danger", response.data);
                    $scope.reload();
                });
            };

            $scope.classifyEltBoard = function () {
                var $modalInstance = $modal.open({
                    animation: false,
                    templateUrl: '/system/public/html/classifyCdesInBoard.html',
                    controller: 'AddClassificationModalCtrl',
                    resolve: {
                        // @TODO bad design -> refactor
                        cde: function () {
                            return null;
                        },
                        orgName: function () {
                            return null;
                        },
                        pathArray: function () {
                            return null;
                        },
                        module: function () {
                            return $scope.board.type;
                        },
                        addClassification: function () {
                            return {
                                addClassification: function (newClassification) {
                                    var _timeout = $timeout(function () {
                                        $scope.addAlert("warning", "Classification task is still in progress. Please hold on.");
                                    }, 3000);
                                    $http({
                                        method: 'post',
                                        url: $scope.board.type === 'form' ? '/classifyFormBoard' : '/classifyCdeBoard',
                                        data: {
                                            boardId: $scope.board._id,
                                            newClassification: newClassification
                                        }
                                    }).then(function onSuccess(response) {
                                        $timeout.cancel(_timeout);
                                        if (response.status === 200) $scope.addAlert("success", "All Elements classified.");
                                        else $scope.addAlert("danger", response.data.error.message);
                                    }).catch(function onError() {
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
            $scope.getReviewers = function () {
                return $scope.board.users.filter(function (u) {
                    return u.role === 'reviewer';
                })
            };
            $scope.modifiedSinceReview = function () {
                var isModifiedSinceReview = false;
                $scope.board.users.forEach(function (u) {
                    if (u.username === userResource.user.username &&
                        u.role === 'reviewer' && u.status.approval === 'approved'
                        && new Date($scope.board.updatedDate) >= new Date(u.status.reviewedDate)) {
                        isModifiedSinceReview = true;
                    }
                });
                return isModifiedSinceReview;
            };

            function isReviewStarted() {
                return $scope.board.review && $scope.board.review.startDate &&
                    new Date($scope.board.review.startDate) < new Date();
            }

            function isReviewEnded() {
                return $scope.board.review && $scope.board.review.endDate &&
                    new Date($scope.board.review.endDate) < new Date();
            }

            $scope.isReviewActive = function () {
                return $scope.board.review && isReviewStarted() && !isReviewEnded();
            };
            $scope.getPendingReviewers = function () {
                return $scope.getReviewers().filter(function (u) {
                    return u.status.approval === 'invited';
                })
            };
            $scope.remindReview = function () {
                $http.post('/board/remindReview', {
                    boardId: $scope.board._id
                }).then(function () {
                    Alert.addAlert('success', "Reminder sent.");
                });
            };
            $scope.canReview = function () {
                return $scope.isReviewActive() &&
                    $scope.board.users.filter(function (u) {
                        return u.role === 'reviewer'
                            && u.username.toLowerCase() === userResource.user.username.toLowerCase();
                    }).length > 0;
            };
            $scope.shareBoard = function () {
                $modal.open({
                    animation: false,
                    templateUrl: '/board/public/html/shareBoard.html',
                    controller: 'ShareBoardCtrl',
                    resolve: {
                        board: function () {
                            return $scope.board;
                        }
                    }
                }).result.then(function (users) {
                    $scope.board.users = users;
                });
            };
            $scope.boardApproval = function (approval) {
                $http.post('/board/approval', {
                    boardId: $scope.board._id,
                    approval: approval
                }).then(function () {
                    $scope.boardStatus = approval;
                    $scope.reload();
                });
            };
            $scope.startReview = function () {
                $http.post("/board/startReview", {
                    boardId: $scope.board._id
                }).then(function onSuccess() {
                    $scope.reload();
                }).catch(function onError(response) {
                    Alert.addAlert("danger", response.data);
                    $scope.reload();
                });
            };
            $scope.endReview = function () {
                $http.post("/board/endReview", {
                    boardId: $scope.board._id
                }).then(function () {
                    $scope.reload(function () {
                        Alert.addAlert('success', 'board review started.')
                    });
                }).catch(function (response) {
                    Alert.addAlert("danger", response.data);
                    $scope.reload();
                });
            };
            $scope.reload();
        }]);

