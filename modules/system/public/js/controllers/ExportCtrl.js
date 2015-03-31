angular.module('systemModule').controller('ExportCtrl', ['$scope', 'Elastic', '$window', '$timeout', function($scope, Elastic, $window, $timeout) {
    var maxExportSize = 500;

    $scope.csvDownloadState = "none";
    $scope.exportSearchResults = function() {
        try {
            var isFileSaverSupported = !!new Blob;
        } catch (e) {
            return $scope.addAlert("danger", "Export feature is not supported in this browser. Please try Google Chrome or Mozilla FireFox.");
        }
        if ($scope.totalItems>maxExportSize) $scope.addAlert("warning", "The search result is too large. It will be capped to " + maxExportSize + " items.");
        $scope.query.query.size = maxExportSize;
        Elastic.getExport($scope.query, $scope.module,  function(result) {
            var blob = new Blob([result], {
                type: "text/csv"
            });
            saveAs(blob, 'SearchExport' + '.csv');
        });
    };

}]);