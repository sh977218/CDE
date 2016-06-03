angular.module('formModule').controller('CreateFormFromBoardModalCtrl', ['$scope', '$uibModalInstance', 'board',
    function ($scope, $modalInstance, board) {
        $scope.elt = board;
        $scope.close = function () {
            $modalInstance.close();
        };
    }
]);