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
            var zipExporter = function() {
                    var zip = new JSZip();
                    JSON.parse(result).forEach(function(omdObj) {
                        zip.file(Object.keys(omdObj)[0] + ".xml", omdObj[Object.keys(omdObj)[0]])
                    });
                    var content = zip.generate({type:"blob"});
                    saveAs(content, "example.zip");
            };
            var exportFiletypes =
            {
                'csv': 'text/csv',
                'json': 'application/json',
                'xml': 'application/xml',
                'odm': 'application/zip'
            };
            if (result) {
                if (type === 'odm') {

                } else {
                    var blob = new Blob([result], {
                        type: exportFiletypes[type]
                    });
                    saveAs(blob, 'SearchExport' + '.' + type);
                    $scope.addAlert("success", "Export downloaded.");
                    $scope.feedbackClass = ["fa-download"];
                }
            }
        });
    };

    $scope.quickBoardExport = function (quickBoard) {
        var result = exports.exportHeader.cdeHeader;
        quickBoard.elts.forEach(function (ele) {
            result += exports.convertToCsv(ele);
        });
        if (result) {
            var blob = new Blob([result], {
                type: "text/csv"
            });
            saveAs(blob, 'QuickBoardExport' + '.csv');
            $scope.addAlert("success", "Export downloaded.");
            $scope.feedbackClass = ["fa-download"];
        } else {
            $scope.addAlert("danger", "Something went wrong, please try again in a minute.");
        }
    }

}])
;