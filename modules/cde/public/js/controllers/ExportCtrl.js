angular.module('cdeModule').controller('ExportCtrl', ['$scope', 'Elastic', '$window', '$timeout', function($scope, Elastic, $window, $timeout) {

    $scope.csvDownloadState = "none";
    $scope.exportSearchResults = function() {
        $scope.query.query.size = 99999;
        $scope.csvDownloadState = "loading";
        Elastic.getExport($scope.query, $scope.module,  function(result) {
            //var blob = new Blob([result], {type: "data:text/csv;charset=utf-8"/*"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"*/});
            //var objectUrl = URL.createObjectURL(blob);
            //$window.open(objectUrl);
            $scope.csvDownloadState = "ready";
            $scope.exportUrl  = "data:text/csv;charset=utf-8,"+result;
            $timeout(function(){
                $window.location.href = $scope.exportUrl;
            }, 1000);
        });
    };

}]);