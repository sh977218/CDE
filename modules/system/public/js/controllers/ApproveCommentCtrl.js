cdeApp.controller('ApproveCommentCtrl', ['$scope', '$http', 'Mail', function($scope, $http, Mail) {
    $scope.approveComment = function(msg) {
        $http.post('/comments/'+msg.typeCommentApproval.element.eltType+'/approve', msg.typeCommentApproval).
            success(function(data, status, headers, config) {
                $scope.addAlert("success", data);
                $scope.closeMessage(msg);
            }).
            error(function(data, status, headers, config) {
                $scope.addAlert("danger", data);
            });
    };
    
    $scope.authorizeUser = function(msg){
//        $http.get('/searchUsers/'+msg.author.name).success(function(response){
//            var u = response.users[0];
//            u.roles.push("CommentReviewer");
//            var request = {username: u.name, roles: u.roles};
//            $http.post("/updateUserRoles", request).
//            success(function(data, status, headers, config) {
//                $scope.addAlert("success", data);
//                $scope.closeMessage(msg);
//            }).
//            error(function(data, status, headers, config) {
//                $scope.addAlert("danger", data);
//            });             
//        });      
        var request = {username: msg.author.name, role: "CommentAuthor"};
        $http.post('/addUserRole', request)
        .success(function(data, status, headers, config) {
            $scope.addAlert("success", data);            
        })
        .error(function(data, status, headers, config) {
            $scope.addAlert("danger", data);
        });        
    };
    
}]);