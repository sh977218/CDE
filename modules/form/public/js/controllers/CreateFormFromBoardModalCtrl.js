angular.module('formModule').controller('CreateFormFromBoardModalCtrl', ['$scope', '$controller', '$uibModalInstance', 'board', 'userResource',
    function ($scope, $controller, $modalInstance, board, userResource) {
        $scope.elt = board;
        $scope.elt.stewardOrg = {};
        $scope.elt.naming = [{}];
        $scope.elt.classification = [];
        $scope.myOrgs = userResource.userOrgs;
        $controller('CreateFormAbstractCtrl', {$scope: $scope});
        $scope.close = function () {
            $modalInstance.close();
        };
    }
]);