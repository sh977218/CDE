angular.module('formModule').controller('MyBoardsCtrl',
    ['$scope', '$uibModal', '$http', 'SearchSettings', 'ElasticBoard', '$timeout', 'Alert',
    function ($scope, $modal, $http, SearchSettings, ElasticBoard, $timeout, Alert) {

        if (!$scope.filter) {
            $scope.filter = {
                tags: [],
                shareStatus: [],
                type:[],
                getSuggestedTags: function (search) {
                    var newSuggestTags = this.suggestTags.slice();
                    if (search && newSuggestTags.indexOf(search) === -1) {
                        newSuggestTags.unshift(search);
                    }
                    return newSuggestTags;
                },
                sortBy: 'createdDate',
                sortDirection: 'desc',
                selectedShareStatus: [],
                selectedTags: [],
                suggestTags: []
            };
        }

        $scope.loadMyBoards = function (cb) {
            ElasticBoard.loadMyBoards($scope.filter, function (response) {
                if (response.hits) {
                    $scope.boards = response.hits.hits.map(function (h) {
                        h._source._id = h._id;
                        return h._source;
                    });
                    $scope.filter.tags = response.aggregations.tagAgg.buckets;
                    $scope.filter.types = response.aggregations.typeAgg.buckets;
                    $scope.filter.shareStatus = response.aggregations.ssAgg.buckets;
                    $scope.filter.suggestTags = response.aggregations.tagAgg.buckets.map(function (t) {
                        return t.key;
                    });
                    if (cb) cb();
                }
            });
        };

        var waitAndReload = function(message) {
            if (!message) message = "Done";
            $scope.reloading = true;
            $timeout(function () {
                $scope.loadMyBoards(function () {
                    $scope.reloading = false;
                    Alert.addAlert("success", message);
                });
            }, 2000);
        };

        $scope.canEditBoard = function () {
            return true;
        };

        $scope.loadMyBoards();

        $scope.removeBoard = function (index) {
            $http['delete']("/board/" + $scope.boards[index]._id).then(function () {
                waitAndReload();
            });
        };

        $scope.cancelSave = function (board) {
            delete board.editMode;
            board.showEdit = false;
        };

        $scope.changeStatus = function (index) {
            var board = $scope.boards[index];
            if (board.shareStatus === "Private") {
                board.shareStatus = "Public";
            } else {
                board.shareStatus = "Private";
            }
            $scope.save(board);
            $scope.showChangeStatus = false;
        };

        $scope.save = function (board) {
            delete board.editMode;
            $http.post("/board", board).then(function onSuccess() {
                waitAndReload("Saved.");
            }).catch(function onError(response) {
                Alert.addAlert("danger", response.data);
            });
        };

    }
]);