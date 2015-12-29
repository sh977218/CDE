angular.module('cdeModule').controller('NewBoardModalCtrl', ['$scope', '$uibModalInstance',
    function($scope, $modalInstance) {
    $scope.newBoard = {};
    
    $scope.cancelCreate = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.okCreate = function() {
        $modalInstance.close($scope.newBoard);
    };
}
]);