systemModule.controller('SelectBoardModalCtrl', ['$scope', '$modalInstance', 'boards', function($scope, $modalInstance, boards) {
    $scope.boards = boards;

    $scope.ok = function (board) {
      $modalInstance.close(board);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
}
]);