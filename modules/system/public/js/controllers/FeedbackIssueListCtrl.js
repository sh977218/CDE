angular.module('systemModule').controller('FeedbackIssueListCtrl', ['$scope', '$controller', '$modal', function($scope, $controller, $modal) {
    $scope.api = "/getFeedbackIssues";
    $scope.errorType = "feedback";
    $scope.fields = ["Date", "User", "Message", "Screenshot", "HTML"];
    $controller('AuditErrorListCtrl', {$scope: $scope});
    $scope.renderImage = function(src){
        return "<img src=\"" + src + "\">";
    };

    $scope.showScreenshot = function(content){
        var modalInstance = $modal.open({
            template: '<img src="'+content+'">'
            , size: "lg"
        });
    };
}]);