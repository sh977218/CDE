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
        Elastic.getExport(Elastic.buildElasticQuerySettings($scope.searchSettings), $scope.module, function (err, result) {
            if (err) return $scope.addAlert("danger", "The server is busy processing similar request, please try again in a minute.");
            var exporters =
            {
                'csv': function(result) {
                    var csv = exports.exportHeader.cdeHeader;
                    JSON.parse(result).forEach(function (ele) {
                        csv += exports.convertToCsv(exports.projectCdeForExport(ele));
                    });
                    var blob = new Blob([csv], {type: "text/csv"});
                    saveAs(blob, 'SearchExport.csv');
                },
                'json': function(result) {
                    var blob = new Blob([result], {type: "application/json"});
                    saveAs(blob, "SearchExport.json");
                },
                'xml': function(result) {
                    var zip = new JSZip();
                    JSON.parse(result).forEach(function(oneElt) {
                        zip.file(oneElt.tinyId + ".xml", JXON.jsToString({element: oneElt}))
                    });
                    var content = zip.generate({type:"blob"});
                    saveAs(content, "SearchExport_XML.zip");
                },
                'odm': function(result) {
                    var zip = new JSZip();
                    JSON.parse(result).forEach(function(oneElt) {
                        exports.getFormOdm(oneElt, function(err, odmElt) {
                            if (err) {
                                // @TODO
                            }
                            else {
                                zip.file(oneElt.tinyId + ".xml", JXON.jsToString({ODM: odmElt}));
                            }
                        });
                    });
                    var content = zip.generate({type:"blob"});
                    saveAs(content, "SearchExport_ODM.zip");
                }
            };
            if (result) {
                var exporter = exporters[type];
                if (!exporter) {
                    $scope.addAlert("danger", "This export format is not supported.")
                } else {
                    exporter(result);
                    $scope.addAlert("success", "Export downloaded.");
                    $scope.feedbackClass = ["fa-download"];
                }
            } else {
                $scope.addAlert("danger", "There was no data to export.");
            }
        });
    };

    $scope.quickBoardExport = function (quickBoard) {
        var result = exports.exportHeader.cdeHeader;
        quickBoard.elts.forEach(function (ele) {
            result += exports.convertToCsv(exports.projectCdeForExport(ele));
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