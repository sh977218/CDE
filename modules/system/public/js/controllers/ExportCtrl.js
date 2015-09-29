angular.module('systemModule').controller('ExportCtrl', ['$scope', 'Elastic', function ($scope, Elastic) {

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
        Elastic.getExport(Elastic.buildElasticQuerySettings($scope.searchSettings), $scope.module, function (result) {
            if (result) {
                var blob = new Blob([result], {
                    type: "text/csv"
                });
                saveAs(blob, 'SearchExport' + '.csv');
                $scope.addAlert("success", "Export downloaded.");
                $scope.feedbackClass = ["fa-download"];
            } else {
                $scope.addAlert("danger", "The server is busy processing similar request, please try again in a minute.");
            }
        });
    };

    $scope.exportAll = function () {
        try {
            var isFileSaverSupported = !!new Blob;
        } catch (e) {
            return $scope.addAlert("danger", "Export feature is not supported in this browser. Please try Google Chrome or Mozilla FireFox.");
        }
        $scope.feedbackClass = ['fa-spinner', 'fa-pulse'];
        $scope.addAlert("warning", "Your export is being generated, please wait.");
        var allSearchSetting = {
            "resultPerPage": 20,
            "selectedElements": [],
            "selectedElementsAlt": [],
            "includeAggregations": true,
            "selectedStatuses": ["Preferred Standard", "Standard", "Qualified", "Recorded", "Candidate", "Incomplete"],
            "visibleStatuses": ["Preferred Standard", "Standard", "Qualified", "Recorded", "Candidate", "Incomplete"]
        };
        Elastic.getExport(Elastic.buildElasticQuerySettings($scope.searchSettings), $scope.module, function (result) {
            if (result) {
                var blob = new Blob([result], {
                    type: "text/csv"
                });
                saveAs(blob, 'ExportAll' + '.csv');
                $scope.addAlert("success", "Export downloaded.");
                $scope.feedbackClass = ["fa-download"];
            } else {
                $scope.addAlert("danger", "The server is busy processing similar request, please try again in a minute.");
            }
        });
    }
}])
;