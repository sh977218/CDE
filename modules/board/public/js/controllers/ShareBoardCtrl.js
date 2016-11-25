angular.module('formModule').controller('ShareBoardCtrl',
    ['$scope', '$location', '$http', '$uibModalInstance', 'board', 'userResource', 'Alert',
        function ($scope, $location, $http, $modalInstance, board, userResource, Alert) {
            $scope.url = $location.absUrl();
            $scope.searchString = '';
            $scope.owner = board.owner;
            $scope.users = angular.copy(board.users);
            $scope.newUser = {username: '', role: 'viewer'};
            $scope.allRoles = [{
                label: 'can review',
                name: 'reviewer',
                icon: 'fa-search-plus'
            }, {
                label: 'can view',
                name: 'viewer',
                icon: 'fa-eye'
            }];
            $scope.addUser = function (newUser) {
                if (newUser.username.trim().length === 0) {
                    Alert.addAlert('danger', 'username is empty');
                    return;
                }
                var existedUser = $scope.users.filter(function (o) {
                    return o.username === newUser.username;
                });
                if (existedUser[0]) {
                    Alert.addAlert('danger', 'username exists');
                    return;
                } else {
                    $scope.users.push(newUser);
                    $scope.newUser = {username: '', role: 'viewer'};
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
            $scope.changeRole = function (newUser, role) {
                newUser.role = role.name;
                newUser.status = 'invited';
            };
            $scope.ok = function () {
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