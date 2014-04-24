function NewBoardModalCtrl($scope, $modalInstance) {
    $scope.newBoard = {};
    
    $scope.cancelCreate = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.okCreate = function() {
        $modalInstance.close($scope.newBoard);
    };
}
