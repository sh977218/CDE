angular.module('systemModule').controller('AuditClientErrorListCtrl', ['$scope', '$controller', function ($scope, $controller) {
    $scope.api = "/getClientErrors";
    $scope.errorType = "client";
    $scope.fields = ["Date", "Name", "Message"];
    $scope.errorDetailFields = [
        {
            label: "Date",
            property: 'date'
        },
        {
            label: "Name",
            property: 'name'
        },
        {
            label: "Message",
            property: 'message'
        },
        {
            label: "User",
            property: 'username'
        },
        {
            label: "IP",
            property: 'ip'
        },
        {
            label: "Browser",
            property: 'userAgent'
        },
        {
            label: "URL",
            property: 'url'
        },
        {
            label: "Stack",
            property: 'stack'
        }];
    $controller('AuditErrorListCtrl', {$scope: $scope});
    $scope.gotoPage(1);
}]);
