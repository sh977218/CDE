angular.module('systemModule').controller('ExportCtrl', ['$scope', 'Elastic', '$window', '$timeout', function ($scope, Elastic, $window, $timeout) {
    var maxExportSize = 500;

    $scope.feedbackClass = ["fa-download"];
    $scope.csvDownloadState = "none";
    $scope.exportSearchResults = function () {
        try {
            var isFileSaverSupported = !!new Blob;
        } catch (e) {
            return $scope.addAlert("danger", "Export feature is not supported in this browser. Please try Google Chrome or Mozilla FireFox.");
        }
        $scope.feedbackClass = ['fa-spinner', 'fa-pulse'];
        $scope.addAlert("warning", "Your export is being generated, please wait.");
        Elastic.getExport(Elastic.buildElasticQuerySettings($scope), $scope.module, function (result) {
            if (result) {
                var blob = new Blob([result], {
                    type: "text/csv"
                });
                saveAs(blob, 'SearchExport' + '.csv');
                $scope.addAlert("success", "Export downloaded.")
                $scope.feedbackClass = ["fa-download"];
            } else {
                $scope.addAlert("danger", "The server is busy processing similar request, please try again in a minute.");
            }
        });
    };
    $scope.exportQuickBoard = function () {
        var result = "Name, Other Names, Value Domain, Permissible Values, Identifiers, Steward, Registration Status, Administrative Status, Used By\n";
        $scope.cdes.forEach(function (ele) {
            result += exports.convertToCsv(exports.formatExportCde(ele));
        });
        if (result) {
            var blob = new Blob([result], {
                type: "text/csv"
            });
            saveAs(blob, 'QuickBoardExport' + '.csv');
            $scope.addAlert("success", "Export downloaded.")
            $scope.feedbackClass = ["fa-download"];
        } else {
            $scope.addAlert("danger", "The server is busy processing similar request, please try again in a minute.");
        }
    }
}]);