 function UsersMgtCtrl($scope, $http) {
    $scope.search = {username: ""};

    $scope.searchUsers = function() {
         $http.get("/searchUsers/" + $scope.search.username).then(function (result) {
             $scope.foundUsers = result.data.users;
             console.log($scope.foundUsers)
         });
    };

    $scope.rolesEnum = exports.rolesEnum;
 };


