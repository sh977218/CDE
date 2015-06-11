angular.module('systemModule').controller('FeedbackIssueListCtrl', ['$scope', '$controller', '$modal', '$rootScope',function($scope, $controller, $modal, $rootScope) {
    $scope.api = "/getFeedbackIssues";
    $scope.errorType = "feedback";
    $scope.fields = ["Date", "User", "Message", "URL", "Screenshot", "Browser", "HTML"];
    $controller('AuditErrorListCtrl', {$scope: $scope});

    $scope.showScreenshot = function(content){
        var modalInstance = $modal.open({
            template: '<a target="_blank" href='+content+'><img src="'+content+'"  style="max-width: 898px;"></a>'
            , size: "lg"
        });
    };

    $scope.showRawHtml = function(content){
        $rootScope.html = content;
        var modalInstance = $modal.open({
            template: '<span ng-bind="html"></span>'
            , size: "lg"
            , scope: $rootScope
        });
    };
}]);