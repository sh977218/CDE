angular.module('cdeModule').controller('MyBoardsCtrl', ['$scope', '$uibModal', '$http', 'Board', function ($scope, $modal, $http, Board) {

    $scope.sortableOptions = {
        handle: '.fa.fa-arrows',
        appendTo: "body",
        revert: true,
        start: function (event, ui) {
            console.log('a');
        }
    };

    $scope.selectedTags = ['All'];

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

    $scope.addNewTag = function (newTag, board) {
        if (!board.tags) board.tags = [];
        if (!newTag || newTag.length === 0) {
            $scope.addAlert("danger", "Tag can not be empty.");
            return;
        }
        if (board.tags.indexOf(newTag) === -1)
            board.tags.push(newTag);
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
        $http.post("/board", board).success(function (response) {
            $scope.addAlert("success", "Saved");
            $scope.updateMyBoardWithTag();
            $scope.getAllMyBoardTags()
        }).error(function (response) {
            $scope.addAlert("danger", response);
            $scope.selectedTags = ['All'];
            $scope.updateMyBoardWithTag();
        });
    };

    $scope.getAllMyBoardTags = function () {
        $http({
            method: 'GET',
            url: '/myBoardTags'
        }).success(function (data) {
            var array = data.map(function (d) {
                return {tagName: d, tagValue: d};
            });
            $scope.tags = [{tagName: 'All', tagValue: 'All'}].concat(array);
        }).error(function () {
            if (err) throw err;
        });
    };

    $scope.getMyBoardSuggestTags = function (s) {
        $http({
            method: 'GET',
            url: '/myBoardTags'
        }).success(function (data) {
            var array = data.map(function (d) {
                return d;
            });
            return array;
        }).error(function () {
            if (err) throw err;
            return [];
        });
    };

    $scope.compareFn = function (obj1, obj2) {
        return obj1 === obj2;
    };

    $scope.updateMyBoardWithTag = function () {
        if ($scope.selectedTags.length > 0)
            $http({
                method: 'GET',
                url: '/getMyTaggedBoards/' + $scope.selectedTags
            }).success(function (data) {
                $scope.boards = data;
            }).error(function (err) {
                if (err) throw err;
            });
        else $scope.boards = [];
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
            Board.save(newBoard, function (res) {
                $scope.addAlert("success", "Board created.");
                $scope.loadMyBoards();
            }, function (message) {
                $scope.addAlert("danger", message.data);
            });
        });
    };
}
]);