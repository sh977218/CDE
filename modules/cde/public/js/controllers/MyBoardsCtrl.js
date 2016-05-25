angular.module('cdeModule').controller('MyBoardsCtrl', ['$scope', '$uibModal', '$http', '$timeout', 'Board', 'userResource', function ($scope, $modal, $http, $timeout, Board, userResource) {

    $scope.myBoardSortBy = ['name', 'description', 'shareStatus', 'createdDate', 'updatedDate'];
    $scope.myBoardSortDir = ['asc', 'desc'];

    $scope.sortMyBoardBy = function (item, model) {
        var user = userResource.user;
        user.searchSettings.myBoard.sortBy = item;
        $timeout(function () {
            $http.post('/user/me', user).then(function (res) {
                if (res.status === 200) {
                    $scope.addAlert("success", "User updated");
                    $scope.updateMyBoardWithTagsAndSort()
                } else {
                    $scope.addAlert("danger", "Error, unable to save");
                }
            });
        }, 0);
    };
    $scope.sortMyBoardDir = function (item, model) {
        var user = userResource.user;
        user.searchSettings.myBoard.sortDir = item;
        $timeout(function () {
            $http.post('/user/me', user).then(function (res) {
                if (res.status === 200) {
                    $scope.addAlert("success", "User updated");
                    $scope.updateMyBoardWithTagsAndSort()
                } else {
                    $scope.addAlert("danger", "Error, unable to save");
                }
            });
        }, 0);
    };
    $scope.selectedTags = [];

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

    $scope.updateTags = function (t, board) {
        if (!board.tags) board.tags = [];
        if (!t || t.length === 0) {
            $scope.addAlert("danger", "Tag can not be empty.");
            return;
        }
        if (board.tags.indexOf(t) === -1)
            board.tags.push(t);
        else $scope.addAlert("danger", "There is already a same tag for this board.");
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
            $scope.updateMyBoardWithTagsAndSort();
        }).error(function (response) {
            $scope.addAlert("danger", response);
            $scope.selectedTags = ['All'];
            $scope.updateMyBoardWithTagsAndSort();
        });
    };


    $scope.getSuggestedTags = function (search) {
        if ($scope.suggestTags) {
            var newSuggs = $scope.suggestTags.slice();
            if (search && newSuggs.indexOf(search) === -1) {
                newSuggs.unshift(search);
            }
            return newSuggs;
        }
    };

    var getAllMyBoardTags = function () {
        $http({
            method: 'GET',
            url: '/myBoardTags'
        }).success(function (response) {
            $scope.tags = response;
            $scope.suggestTags = response.map(function (h) {
                return h.key;
            });
        }).error(function (err) {
            if (err) throw err;
            $scope.suggestTags = [];
        });
    };
    getAllMyBoardTags();

    $scope.updateMyBoardWithTagsAndSort = function () {
        if ($scope.selectedTags.length === 0)
            $scope.selectedTags = ['All'];
        $http({
            method: 'GET',
            url: '/getMyTaggedBoards/' + $scope.selectedTags
        }).success(function (response) {
            $scope.boards = response.hits.hits.map(function (h) {
                return h._source;
            });
            $scope.tags = response.aggregations.aggregationsName.buckets;
        }).error(function (err) {
            if (err) throw err;
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
                $scope.loadMyBoards();
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