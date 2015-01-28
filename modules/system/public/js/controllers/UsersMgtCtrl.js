 function UsersMgtCtrl($scope, $http, $timeout) {
    $scope.search = {username: ""};

    $scope.searchUsers = function() {
         $http.get("/searchUsers/" + $scope.search.username).then(function (result) {
             $scope.foundUsers = result.data.users;
         });
    };

    $scope.rolesEnum = exports.rolesEnum;
    
    $scope.updateRoles = function(user) {
        $timeout(function() {
            $http.post("/updateUserRoles", user).then(function (res) {
                $scope.addAlert("success", "Roles Saved.");
            });}
        , 0);
    };
    
 };


