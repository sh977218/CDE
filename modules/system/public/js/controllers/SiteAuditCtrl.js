 function SiteAuditCtrl($scope, $http) {
       $scope.search = {username: ""};
       
       $scope.searchUsers = function() {
            $http.get("/searchUsers/" + $scope.search.username).then(function (result) {
                $scope.foundUsers = result.data.users;
            });
       };
       
 };


