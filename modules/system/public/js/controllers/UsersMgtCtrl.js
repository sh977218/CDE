 angular.module('systemModule').controller('UsersMgtCtrl',
     ['$scope', '$http', '$timeout', '$uibModal', 'Alert', function($scope, $http, $timeout, $modal, Alert) {

    $scope.search = {username: ""};

    $scope.searchUsers = function() {
         $http.get("/searchUsers/" + $scope.search.username).then(function (result) {
             $scope.foundUsers = result.data.users;
             if ($scope.foundUsers.length === 1) $scope.getComments(1);
             else delete $scope.latestComments;
         });
    };

    $scope.rolesEnum = exports.rolesEnum;

     $scope.updateAvatar = function(user) {
         $http.post("/updateUserAvatar", user).then(function () {
             $scope.addAlert("success", "Saved.");
         });
     };

    $scope.updateRoles = function(user) {
        $timeout(function() {
            $http.post("/updateUserRoles", user).then(function () {
                $scope.addAlert("success", "Roles saved.");
            });}
        , 0);
    };

     $scope.openCreateUser = function() {
         $modal.open({
             animation: false,
             templateUrl: '/system/public/html/newUserModal.html',
             controller: function() {}
         }).result.then(function (username) {
             $http.put("/user", {username: username}).success(function() {
                 Alert.addAlert("success", "User created");
             });
         });
     };

     $scope.getComments = function (page) {
         if ($scope.foundUsers && $scope.foundUsers[0]) {
             $http.get("/commentsFor/" + $scope.foundUsers[0].username + "/" + (page - 1) * 30 + "/30").then(function (result) {
                 $scope.comments.latestComments = result.data;
                 if ($scope.comments.latestComments.length === 0) {
                     $scope.comments.totalItems = (page - 2) * 30;
                 } else if ($scope.comments.latestComments.length < 30) {
                     $scope.comments.totalItems = (page - 1) * 30 + $scope.comments.latestComments.length;
                 }
             });
         }
     };

     $scope.$watch("comments.currentCommentsPage", function () {
         $scope.getComments($scope.comments.currentCommentsPage);
     });
     $scope.comments = {currentCommentsPage: 1, totalItems: 10000};

     $scope.getEltLink = function(c) {
         return {
                 'cde': "/deview?tinyId=",
                 'form': "/formView?tinyId=",
                 'board': "/board/"
             }[c.element.eltType] + c.element.eltId;
     }

}]);


