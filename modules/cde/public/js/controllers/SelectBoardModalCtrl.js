angular.module('cdeModule').controller('SelectBoardModalCtrl', ['$scope', '$uibModalInstance', 'ElasticBoard',
    function($scope, $modalInstance, ElasticBoard)
{

    ElasticBoard.loadMyBoards($scope);

    $scope.ok = function (board) {
      $modalInstance.close(board);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
}
]);