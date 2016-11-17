angular.module('formModule').controller('AddReviewerToBoardCtrl',
    ['$scope', '$uibModalInstance', 'board', 'userResource', 'Form', '$http',
        function ($scope, $modalInstance, board, userResource, Form, $http) {
            $scope.searchString = '';
            $scope.board = board;
            $scope.searchUsersByUsername = function () {
                if ($scope.searchString.trim().length === 0) {
                    return;
                } else {
                    $http.get('/user/' + $scope.searchString).then(function (response) {
                        if (!response.error) {
                            $scope.searchUsers = response.data;
                        }
                    });
                }
            };
            $scope.saveBoardUsers = function (u) {
                if (!$scope.board.users) $scope.board.users = [];
                $scope.board.users.push({username: $scope.searchString});
            }
        }
    ]);