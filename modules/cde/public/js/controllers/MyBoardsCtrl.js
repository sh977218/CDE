angular.module('cdeModule').controller('MyBoardsCtrl', ['$scope', '$uibModal', '$http', 'Board', 'SearchSettings', 'ElasticBoard',
    function ($scope, $modal, $http, Board, SearchSettings, ElasticBoard) {
        $scope.filter = {
            sortByOptions: ['name', 'description', 'shareStatus', 'createdDate', 'updatedDate'],
            sortDirectionOptions: ['asc', 'desc'],
            tags: [],
            reset: function () {
                this.selectedTags = [];
                this.sortBy = 'updatedDate';
                this.sortDirection = 'desc';
            },
            getSuggestedTags: function (search) {
                var newSuggestTags = this.suggestTags.slice();
                if (search && newSuggestTags.indexOf(search) === -1) {
                    newSuggestTags.unshift(search);
                }
                return this.suggestTags = newSuggestTags;
            },
            sortBy: '',
            sortDirection: '',
            selectedTags: [],
            suggestTags: []
        };

        $scope.loadMyBoards = function () {
            ElasticBoard.loadMyBoards($scope.filter, function (response) {
                $scope.boards = response.hits.hits.map(function (h) {
                    h._source._id = h._id;
                    return h._source;
                });
                $scope.filter.tags = response.aggregations.aggregationsName.buckets;
                $scope.filter.suggestTags = response.aggregations.aggregationsName.buckets.map(function (t) {
                    return t.key;
                });
            });
        };

        $scope.loadMyBoards();

        $scope.removeBoard = function (index) {
            $http['delete']("/board/" + $scope.boards[index]._id).then(function (response) {
                $scope.addAlert("success", "Board removed");
                $scope.boards.splice(index, 1);
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
                setTimeout($scope.loadMyBoards, 1000);
            }).error(function (response) {
                $scope.filter.reset();
                $scope.addAlert("danger", response);
                $scope.filter.reset();
                setTimeout($scope.loadMyBoards, 1000);
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
                Board.save(newBoard, function () {
                    $scope.addAlert("success", "Board created.");
                    setTimeout($scope.loadMyBoards, 1000);
                }, function (message) {
                    $scope.addAlert("danger", message.data);
                });
            });
        };

        $scope.sortableOptions = {
            handle: '.fa.fa-arrows',
            appendTo: "body",
            revert: true,
            start: function (event, ui) {
                $('.dragDiv').css('border', '2px dashed grey');
                ui.placeholder.height("20px");
            },
            stop: function (e, ui) {
                $scope.save($scope.boards);
                $('.dragDiv').css('border', '');
            },
            helper: function () {
                return $('<div class="placeholderForDrop"><i class="fa fa-arrows"></i> Drop Me</div>')
            }
        };
    }
]);