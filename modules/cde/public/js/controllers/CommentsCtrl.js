function CommentsCtrl($scope, Comment) {
    
    $scope.canRemoveComment = function(com) {
        return (($scope.user._id) && 
+                ($scope.user._id == com.user ||
+                ($scope.user.orgAdmin.indexOf($scope.elt.stewardOrg.name) > -1) ||
+                $scope.user.siteAdmin ) );
    };
    
    $scope.addComment = function() {        
        Comment.addComment({
            comment: $scope.comment.content
            , deId: $scope.elt._id
            },
            function(res) {
                  $scope.addAlert("success", res.message);  
                  $scope.elt = res.de;
            }
        );
        $scope.comment.content = "";
    };
    
    $scope.removeComment = function(commentId) {
        Comment.removeComment({
            commentId: commentId
            , deId: $scope.elt._id 
        }, 
        function (res) {
            $scope.addAlert("success", res.message);
            $scope.elt = res.de;
        });
    };
}
