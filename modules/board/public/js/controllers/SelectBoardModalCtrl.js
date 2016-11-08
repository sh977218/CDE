angular.module('formModule').controller('SelectBoardModalCtrl', ['$scope', 'type',
    function ($scope, type) {
        $scope.filter = {
            reset: function () {
                this.tags = [];
                this.sortBy = 'updatedDate';
                this.sortDirection = 'desc';
            },
            sortBy: 'updatedDate',
            sortDirection: 'desc',
            tags: [],
            selectedTypes: [type],
            types: ['cde', 'form']
        };
    }
]);