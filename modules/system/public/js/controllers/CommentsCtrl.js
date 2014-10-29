function CommentsCtrl($scope, $http) {
    $scope.comment = {};
        
    $scope.canRemoveComment = function(com) {
        return (($scope.user._id) && 
                ($scope.user._id === com.user ||
                ($scope.user.orgAdmin.indexOf($scope.elt.stewardOrg.name) > -1) ||
                $scope.user.siteAdmin ) );
    };
    
    $scope.addComment = function() {  
        $http.post("/comments/" + $scope.module + "/add", {
            comment: $scope.comment.content
            , eltId: $scope.elt._id
        }).then(function(res) {
              $scope.addAlert("success", res.data.message);  
              $scope.elt = res.data.elt;
        });
        $scope.comment.content = "";
    };
    
    $scope.removeComment = function(commentId) {
        $http.post("/comments/" + $scope.module + "/remove", {
            commentId: commentId
            , eltId: $scope.elt._id 
        }).then(function (res) {
            $scope.addAlert("success", res.data.message);
            $scope.elt = res.data.elt;
        });
    };
}
