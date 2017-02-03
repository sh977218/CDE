angular.module('systemModule').controller('FeedbackIssueListCtrl',
    ['$scope', '$controller', '$uibModal', '$rootScope',
        function($scope, $controller, $modal, $rootScope) {

    $scope.$on('Reported Issues', function () {
        if (!$scope.api) {
            $scope.api = "/getFeedbackIssues";
            $scope.errorType = "feedback";
            $scope.fields = ["Date", "User", "Message", "URL", "Screenshot", "Browser", "HTML"];
            $controller('AuditErrorListCtrl', {$scope: $scope});

            $scope.showScreenshot = function(content){
                $modal.open({
                    animation: false,
                    template: '<a target="_blank" href='+content+'><img src="'+content+'"  style="max-width: 898px;"></a>'
                    , size: "lg"
                }).result.then(function () {}, function() {});
            };

            $scope.showRawHtml = function(content){
                $rootScope.html = content;
                $modal.open({
                    animation: false,
                    template: '<span ng-bind="html"></span>'
                    , size: "lg"
                    , scope: $rootScope
                }).result.then(function () {}, function() {});
            };

            $scope.gotoPage(1);
        }
    });

}]);