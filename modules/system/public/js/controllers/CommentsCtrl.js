systemModule.controller('CommentsCtrl', ['$scope', '$http', 'userResource', function($scope, $http, userResource) {
    $scope.comment = {};
        
    $scope.canRemoveComment = function(com) {
        return ((userResource.user._id) && 
                (userResource.user._id === com.user ||
                (userResource.user.orgAdmin.indexOf($scope.elt.stewardOrg.name) > -1) ||
                userResource.user.siteAdmin ) );
    };
    
    $scope.addComment = function() {  
        $http.post("/comments/" + $scope.module + "/add", {
            comment: $scope.comment.content
            , element: {tinyId: $scope.elt.tinyId}
        }).then(function(res) {
              $scope.addAlert("success", res.data.message);  
              $scope.elt = res.data.elt;
        });
        $scope.comment.content = "";
    };
    
    $scope.removeComment = function(commentId) {
        $http.post("/comments/" + $scope.module + "/remove", {
            commentId: commentId
            , element: {tinyId: $scope.elt.tinyId}
        }).then(function (res) {
            $scope.addAlert("success", res.data.message);
            $scope.elt = res.data.elt;
        });
    };
}
]);