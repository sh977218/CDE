angular.module('cdeModule').controller('MyBoardsCtrl', ['$scope', '$uibModal', '$http', 'SearchSettings', 'ElasticBoard',
    function ($scope, $modal, $http, SearchSettings, ElasticBoard) {

        $scope.filter = {
            tags: [],
            shareStatus: [],
            getSuggestedTags: function (search) {
                var newSuggestTags = this.suggestTags.slice();
                if (search && newSuggestTags.indexOf(search) === -1) {
                    newSuggestTags.unshift(search);
                }
                return newSuggestTags;
            },
            sortBy: 'name',
            sortDirection: 'asc',
            selectedShareStatus: [],
            selectedTags: [],
            suggestTags: []
        };

        $scope.loadMyBoards = function (cb) {
            ElasticBoard.loadMyBoards($scope.filter, function (response) {
                $scope.boards = response.hits.hits.map(function (h) {
                    h._source._id = h._id;
                    return h._source;
                });
                $scope.filter.tags = response.aggregations.tagAgg.buckets;
                $scope.filter.shareStatus = response.aggregations.ssAgg.buckets;
                $scope.filter.suggestTags = response.aggregations.tagAgg.buckets.map(function (t) {
                    return t.key;
                });
                if (cb) cb();
            });
        };

        $scope.canEditBoard = function () {
            return true;
        };

        $scope.loadMyBoards();

        $scope.removeBoard = function (index) {
            $http['delete']("/board/" + $scope.boards[index]._id).then(function () {
                $scope.addAlert("success", "Board removed");
                $scope.loadMyBoards();
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
            $http.post("/board", board).success(function () {
                $scope.addAlert("success", "Saved");
                $scope.loadMyBoards();
            }).error(function (response) {
                $scope.addAlert("danger", response);
            });
        };

        $scope.openNewBoard = function () {
            var modalInstance = $modal.open({
                animation: false,
                templateUrl: 'newBoardModalContent.html',
                controller: 'NewBoardModalCtrl',
                resolve: {}
            });
            modalInstance.result.then(function (newBoard) {
                newBoard.shareStatus = "Private";
                $http.post("/board", newBoard).success(function () {
                    $scope.loadMyBoards(function () {
                        $scope.addAlert("success", "Board created.");
                    });
                }, function (message) {
                    $scope.addAlert("danger", message.data);
                });
            });
        };
    }
]);