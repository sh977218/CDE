 angular.module('systemModule').controller('UsersMgtCtrl',
     ['$scope', '$http', '$timeout', '$uibModal', 'Alert', function($scope, $http, $timeout, $modal, Alert) {

    $scope.search = {username: ""};

    $scope.searchUsers = function() {
         $http.get("/searchUsers/" + $scope.search.username).then(function (result) {
             $scope.foundUsers = result.data.users;
             //$scope.foundUsers.forEach(function (u) {u.avatarUrl = "";})
         });
    };

    $scope.rolesEnum = exports.rolesEnum;

     $scope.updateAvatar = function(user) {
         $http.post("/updateUserAvatar", user).then(function (res) {
             $scope.addAlert("success", "Saved.");
         });
     };

    $scope.updateRoles = function(user) {
        $timeout(function() {
            $http.post("/updateUserRoles", user).then(function (res) {
                $scope.addAlert("success", "Roles saved.");
            });}
        , 0);
    };

     $scope.openCreateUser = function() {
         $modal.open({
             animation: false,
             templateUrl: 'newUserModal.html',
             controller: function() {}
         }).result.then(function (newUser) {
             $http.put("/user", newUser).success(function(res) {
                 Alert.addAlert("success", "User created");
             })
         });
     }
    
}]);


