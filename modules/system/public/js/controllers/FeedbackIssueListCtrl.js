angular.module('systemModule').controller('FeedbackIssueListCtrl', ['$scope', '$controller', function($scope, $controller) {
    $scope.api = "/getFeedbackIssues";
    $scope.errorType = "feedback";
    $scope.fields = ["Date", "Message", "Screenshot", "HTML"];
    $controller('AuditErrorListCtrl', {$scope: $scope});
}]);