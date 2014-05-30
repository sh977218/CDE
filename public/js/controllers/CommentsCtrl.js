function CommentsCtrl($scope, Comment) {
    
    $scope.canRemoveComment = function(com) {
        return (($scope.user._id) && 
+                ($scope.user._id == com.user ||
+                ($scope.user.orgAdmin.indexOf($scope.cde.stewardOrg.name) > -1) ||
+                $scope.user.siteAdmin ) );
    };
    
    $scope.addComment = function() {        
        Comment.addComment({
            comment: $scope.comment.content
            , deId: $scope.cde._id
            },
            function(res) {
                  $scope.addAlert("success", res.message);  
                  $scope.cde = res.de;
            }
        );
        $scope.comment.content = "";
    };
    
    $scope.removeComment = function(commentId) {
        Comment.removeComment({
            commentId: commentId
            , deId: $scope.cde._id 
        }, 
        function (res) {
            $scope.addAlert("success", res.message);
            $scope.cde = res.de;
        });
    };
}
