angular.module('formModule').controller('ShareBoardCtrl',
    ['$scope', '$location', '$http', '$uibModalInstance', 'board', 'userResource',
        function ($scope, $location, $http, $modalInstance, board, userResource) {
            $scope.url = $location.absUrl();
            $scope.searchString = '';
            $scope.owner = board.owner;
            $scope.users = angular.copy(board.users);
            $scope.newUser = {roles: []};
            $scope.allRoles = ['reviewer', 'viewer', 'editor'];
            $scope.sendInvitation = function (newUser) {
                if (newUser.username.trim().length === 0) {
                    alert('username is empty');
                    return;
                }
                var existedUser = $scope.users.filter(function (o) {
                    return o.username === newUser.username;
                });
                if (existedUser[0]) {
                    alert('user exists');
                } else {
                    $scope.users.push(newUser);
                    $scope.newUser = {roles: []};
                }
            };
            $scope.deleteUser = function (u) {
                $scope.users = $scope.users.filter(function (o) {
                    return o.username !== u.username;
                })
            };
            $scope.saveBoardUsers = function (u) {
                if (!$scope.users) $scope.users = [];
                $scope.users.push({username: $scope.searchString});
            };
            $scope.changeRole = function (user, role) {
                if (user.roles.indexOf(role) !== -1) {
                    user.roles = user.roles.filter(function (r) {
                        return r !== role;
                    })
                } else {
                    user.roles.push(role);
                    user.status = 'invited';
                }
            };
            $scope.startReview = function () {
                $http.post('/board/users', {
                    boardId: board._id,
                    user: userResource.user,
                    owner: board.owner,
                    users: $scope.users
                }).then(function (response) {
                    $modalInstance.close($scope.users);
                });
            }
        }
    ]);