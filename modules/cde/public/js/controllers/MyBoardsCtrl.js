angular.module('cdeModule').controller('MyBoardsCtrl', ['$scope', '$uibModal', '$http', 'Board', function ($scope, $modal, $http, Board) {

    $scope.sortableOptions = {
        handle: '.fa.fa-arrows'
    };

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

    $scope.addNewLabel = function (newLabel, board) {
        if (!board.labels) board.lables = [];
        if (!newLabel || newLabel.length === 0) {
            $scope.addAlert("danger", "Label can not be empty.");
            return;
        }
        if (board.labels.indexOf(newLabel) === -1)
            board.labels.push(newLabel);
        else $scope.addAlert("danger", "There is already a label for this board.");
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
            $scope.loadMyBoards();
        }).error(function (response) {
            $scope.addAlert("danger", response);
            $scope.loadMyBoards();
        });
    };

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


    $scope.compareFn = function (obj1, obj2) {
        return obj1.id === obj2.id;
    };

    $scope.updateMyBoardWithTag = function (tagValue) {
        $http({
            method: 'GET',
            url: '/getMyTaggedBoards/' + tagValue
        }).success(function (data) {
            $scope.boards = data;
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