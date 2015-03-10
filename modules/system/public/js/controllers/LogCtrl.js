angular.module('systemModule').controller('LogCtrl', ['$scope', '$http', 'CsvDownload', function($scope, $http, CsvDownload) {
        
    $scope.gridLogEvents = [];
    $scope.gridOptions = {
        data: 'gridLogEvents'
        , enableColumnResize: true
        , enableRowReordering: true
        , enableCellSelection: true
    };

    $scope.search = {};
    
    $scope.downloadCsv = function() {
       CsvDownload.export($scope.gridLogEvents); 
    };
    
    $scope.searchLogs = function () {
        $scope.gridLogEvents = [];

        $http.post("/logs", {query: $scope.search}).then(function (res) {
            if (res.data.error !== undefined) {
                $scope.addAlert("danger", res.data.error);
            }
            for (var i in res.data) {
                var elt = res.data[i];
                if (elt !== undefined) {
                    $scope.gridLogEvents.push({
                      date: new Date(elt.date).toLocaleString()
                      , ip: elt.remoteAddr
                      , url: elt.url
                      , method: elt.method
                      , status: elt.httpStatus
                    });
                }
            }
        });
    };    
}
]);