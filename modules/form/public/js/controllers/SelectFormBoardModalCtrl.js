angular.module('formModule').controller('SelectFormBoardModalCtrl', ['$scope', '$uibModalInstance',
    function ($scope, $modalInstance) {
        $scope.filter = {
            reset: function () {
                this.tags = [];
                this.sortBy = 'updatedDate';
                this.sortDirection = 'desc';
            },
            sortBy: 'updatedDate',
            sortDirection: 'desc',
            tags: [],
            selectedTypes: ['form']
        };

        $scope.ok = function (board) {
            $modalInstance.close(board);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }
]);