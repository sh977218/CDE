angular.module('systemModule').controller('LogCtrl', ['$scope', '$http', 'CsvDownload', function($scope, $http, CsvDownload) {
        
    $scope.gridLogEvents = [];
    $scope.gridOptions = {
        data: 'gridLogEvents'
        , enableColumnResize: true
        , enableRowReordering: true
        , enableCellSelection: true
    };

    $scope.search = {currentPage: 0};
    
    $scope.$on('showLogsForIP', function(event, args) {
        $scope.search.remoteAddr = args.IP;
        $scope.searchLogs();
    });
    
    $scope.downloadCsv = function() {
       CsvDownload.export($scope.gridLogEvents); 
    };
    
    $scope.pageChanged = function() {
        $scope.searchLogs();
    };
    
    $scope.searchLogs = function () {
        $scope.gridLogEvents = [];

        $http.post("/logs", {query: $scope.search}).then(function (res) {
            if (res.data.error !== undefined) {
                $scope.addAlert("danger", res.data.error);
            }
            $scope.totalItems = res.data.count;
            $scope.itemsPerPage = res.data.itemsPerPage;
            res.data.logs.forEach(function(log) {
                if (log !== undefined) {
                    $scope.gridLogEvents.push({
                      date: new Date(log.date).toLocaleString()
                      , ip: log.remoteAddr
                      , url: log.url
                      , method: log.method
                      , status: log.httpStatus
                    });
                }                
            });            
        });
    };    
}
]);