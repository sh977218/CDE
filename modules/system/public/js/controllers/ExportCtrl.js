angular.module('systemModule').controller('ExportCtrl', ['$scope', 'Elastic', function ($scope, Elastic) {

    $scope.feedbackClass = ["fa-download"];
    $scope.csvDownloadState = "none";

    $scope.exportSearchResults = function (type) {
        try {
            !!new Blob;
        } catch (e) {
            return $scope.addAlert("danger", "Export feature is not supported in this browser. Please try Google Chrome or Mozilla FireFox.");
        }
        $scope.feedbackClass = ['fa-spinner', 'fa-pulse'];
        $scope.addAlert("warning", "Your export is being generated, please wait.");
        Elastic.getExport(Elastic.buildElasticQuerySettings($scope.searchSettings), $scope.module, "json", function (err, result) {
            if (err) return $scope.addAlert("danger", "The server is busy processing similar request, please try again in a minute.");
            var zipExporter = function(result, filename) {
                var zip = new JSZip();
                JSON.parse(result).forEach(function(srcObj) {
                    zip.file(Object.keys(srcObj)[0] + ".xml", srcObj[Object.keys(srcObj)[0]])
                });
                var content = zip.generate({type:"blob"});
                $scope.addAlert("success", "Export downloaded.");
                saveAs(content, filename);
            };
            var bulkExporter = function(result, filename, mimeType) {
                var blob = new Blob([result], {
                    type: mimeType
                });
                saveAs(blob, filename);
                $scope.addAlert("success", "Export downloaded.");
                $scope.feedbackClass = ["fa-download"];
            };
            var exporters =
            {
                'csv': {type: 'text/csv', exporter: bulkExporter, filename: "SearchExport.csv"},
                'json': {type: 'application/json', exporter: bulkExporter, filename: "SearchExport.json"},
                'xml': {type: 'application/zip', exporter: function(result) {
                    var zip = new JSZip();
                    JSON.parse(result).forEach(function(oneElt) {
                        zip.file(oneElt.tinyId + ".xml", JXON.jsToString({dataElement: oneElt}))
                    });
                    var content = zip.generate({type:"blob"});
                    $scope.addAlert("success", "Export downloaded.");
                    saveAs(content, "SearchExport_XML.zip");
                }, filename: "SearchExport_XML.zip"},
                'odm': {type: 'application/zip', exporter: zipExporter, filename: "SearchExport_ODM.zip"}
            };
            if (result) {
                var exporter = exporters[type];
                if (!exporter) {
                    $scope.addAlert("danger", "This export format is not supported.")
                } else {
                    exporter.exporter(result, exporter.filename, exporter.type);
                }
            } else {
                $scope.addAlert("danger", "There was no data to export.");
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