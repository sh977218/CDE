angular.module('systemModule').controller('ExportCtrl', ['$scope', 'Elastic', function ($scope, Elastic) {

    $scope.feedbackClass = ["fa-download"];
    $scope.csvDownloadState = "none";

    $scope.exportSearchResults = function (type) {
        try {
            var isFileSaverSupported = !!new Blob;
        } catch (e) {
            return $scope.addAlert("danger", "Export feature is not supported in this browser. Please try Google Chrome or Mozilla FireFox.");
        }
        $scope.feedbackClass = ['fa-spinner', 'fa-pulse'];
        $scope.addAlert("warning", "Your export is being generated, please wait.");
        Elastic.getExport(Elastic.buildElasticQuerySettings($scope.searchSettings), $scope.module, type, function (err, result) {
            if (err) return $scope.addAlert("danger", "The server is busy processing similar request, please try again in a minute.");
            var exportFiletypes =
                {
                    'csv': 'text/csv',
                    'json': 'application/json',
                    'xml': 'application/xml'
                };
            if (result) {
                var blob = new Blob([result], {
                    type: exportFiletypes[type]
                });
                saveAs(blob, 'SearchExport' + '.' + type);
                $scope.addAlert("success", "Export downloaded.");
                $scope.feedbackClass = ["fa-download"];
            }
        });
    };

}])
;