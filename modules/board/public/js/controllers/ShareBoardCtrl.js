angular.module('formModule').controller('ShareBoardCtrl',
    ['$scope', '$location', '$uibModalInstance', 'board', 'userResource', 'Form', '$http',
        function ($scope, $location, $modalInstance, board, userResource, Form, $http) {
            $scope.url = $location.absUrl();
            $scope.searchString = '';
            $scope.board = board;
            $scope.newUser = {};
            $scope.sendInvitation = function (newUser) {
                if (newUser.username.trim().length === 0) {
                    alert('username is empty');
                    return;
                }
                var existedUser = board.users.filter(function (o) {
                    return o.username === newUser.username;
                });
                if (existedUser[0]) {
                    alert('user exists');
                } else {
                    board.users.push(newUser);
                    $scope.newUser = {};
                }
            };
            $scope.deleteUser = function (u) {
                board.users = board.users.filter(function (o) {
                    return o.username !== u.username;
                })
            };
            $scope.saveBoardUsers = function (u) {
                if (!$scope.board.users) $scope.board.users = [];
                $scope.board.users.push({username: $scope.searchString});
            }
        }
    ]);