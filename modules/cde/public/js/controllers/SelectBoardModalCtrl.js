function SelectBoardModalCtrl($scope, $modalInstance, boards) {
    $scope.boards = boards;

    $scope.ok = function (board) {
      $modalInstance.close(board);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
}
