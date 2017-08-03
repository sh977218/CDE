angular.module('formModule').controller('CreateFormFromBoardModalCtrl',
    ['$scope', '$uibModalInstance', 'elt',
        function ($scope, $modalInstance, elt) {
            $scope.elt = elt;

            $scope.closeModal = function () {
                $modalInstance.close();
            };
        }
    ]);