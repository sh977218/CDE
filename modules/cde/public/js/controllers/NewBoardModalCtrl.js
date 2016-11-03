angular.module('cdeModule').controller('NewBoardModalCtrl', ['$scope',
    function ($scope) {
        $scope.newBoard = {
            type: 'cde'
        };
    }
]);