angular.module('cdeModule').controller('SelectBoardModalCtrl', ['$scope', '$uibModalInstance', 'ElasticBoard',
    function ($scope, $modalInstance, ElasticBoard) {
        var filter = {
            reset: function () {
                this.tags = [];
                this.sortBy = 'updatedDate';
                this.sortDirection = 'desc';
            },
            sortBy: '',
            sortDirection: '',
            tags: []
        };
        ElasticBoard.loadMyBoards(filter, function (response) {
            $scope.boards = response.hits.hits.map(function (h) {
                h._source._id = h._id;
                return h._source;
            });
        });

        $scope.ok = function (board) {
            $modalInstance.close(board);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }
]);