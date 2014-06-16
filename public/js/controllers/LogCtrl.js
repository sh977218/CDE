function LogCtrl($scope, $http) {
        
    $scope.gridLogEvents = [];
    $scope.gridOptions = {
        data: 'gridLogEvents'
        , enableColumnResize: true
        , enableRowReordering: true
        , enableCellSelection: true
    };
    
    $scope.searchLogs = function () {
        gridLogEvents = [];
        var query = {};
        query.remoteAddress = $scope.search.ip;
        $http.post("/logs", {query: query}).then(function (res) {
            for (var i in res.data) {
                var elt = res.data[i];
                if (elt !== undefined && elt.msg !== undefined) {
                    $scope.gridLogEvents.push({
                      date: elt.msg.date
                      , ip: elt.msg.remoteAddr
                      , url: elt.msg.url
                      , method: elt.msg.method
                      , status: elt.msg.httpStatus
                    });
                }
            }
        });
    };    
}
