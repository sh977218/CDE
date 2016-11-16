angular.module('formModule').controller('AddReviewerToBoardCtrl',
    ['$scope', '$uibModalInstance', 'board', 'userResource', 'Form', '$http',
        function ($scope, $modalInstance, board, userResource, Form, $http) {
            $scope.searchString = '';
            $scope.board = board;
            $scope.addUserToBoard = function () {
                if (!$scope.board.reviewer) $scope.board.reviewer = [];
                $scope.board.reviewer.push({username: $scope.searchString});
            }
        }
    ]);