angular.module('systemModule').controller('SiteAuditCtrl', ['$scope', function($scope) {
        
    $scope.tabs = [
        {title: "Logs"},
        {title: "Usage"},
        {title: "Server Errors"},
        {title: "Client Errors"}
    ];
    
    $scope.showLogsForIP = function(IP) {
        $scope.tabs[0].active = true;
        $scope.$broadcast('showLogsForIP', {IP: IP});
    };
        
}]);
