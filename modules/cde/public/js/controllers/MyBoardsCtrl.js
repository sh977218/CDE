angular.module('cdeModule').controller('MyBoardsCtrl', ['$scope', '$modal', '$http', 'Board', function($scope, $modal, $http, Board) {
    $scope.removeBoard = function(index) {
        $http['delete']("/board/" + $scope.boards[index]._id).then(function (response) {
            $scope.addAlert("success", "Board removed");
            $scope.boards.splice(index, 1);
        });
    };        
    
    $scope.cancelSave = function(board) {
        delete board.editMode;
    };
    
    $scope.changeStatus = function(index) {
        var board = $scope.boards[index];
        if (board.shareStatus === "Private") {
            board.shareStatus = "Public";
        } else {
            board.shareStatus = "Private";
        }
        $scope.save(board);
        $scope.showChangeStatus = false;
    };
        
    $scope.save = function(board) {
        delete board.editMode; 
        $http.post("/board", board).success(function(response) {
            $scope.addAlert("success", "Saved");
            $scope.loadMyBoards();
        }).error(function(response){
            $scope.addAlert("danger", response);
            $scope.loadMyBoards();
        });
    };
        
    $scope.openNewBoard = function () {
        var modalInstance = $modal.open({
          templateUrl: 'newBoardModalContent.html',
          controller: 'NewBoardModalCtrl',
          resolve: {
          }
        });
        modalInstance.result.then(function (newBoard) {
            console.log("creating board")
            newBoard.shareStatus = "Private";
            Board.save(newBoard, function(res) {
                console.log("save success");
                $scope.addAlert("success", "Board created.");
                $scope.loadMyBoards();
            }, function(message){
                console.log("save fail: " + message.data);
                $scope.addAlert("danger", message.data);
            });
        });
    };
}
]);