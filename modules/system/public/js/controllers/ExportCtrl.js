angular.module('systemModule').controller('ExportCtrl', ['$scope', 'Elastic', 'SearchSettings', '$http', 'RegStatusValidator',
    function ($scope, Elastic, SearchSettings, $http, RegStatusValidator) {
        $scope.feedbackClass = ["fa-download"];
        $scope.csvDownloadState = "none";

        $scope.exportSearchResults = function (type) {
            if ($scope.module === 'form' && (!$scope.user || !$scope.user._id)) {
                return $scope.Alert.addAlert("danger", "Please login to access this feature");
            }

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
                    'csv': function (result) {
                        SearchSettings.getPromise().then(function (settings) {
                            var csv = exports.getCdeCsvHeader(settings.tableViewFields);
                            JSON.parse(result).forEach(function (ele) {
                                csv += exports.convertToCsv(exports.projectCdeForExport(ele, settings.tableViewFields));
                            });
                            var blob = new Blob([csv], {type: "text/csv"});
                            saveAs(blob, 'SearchExport.csv');  // jshint ignore:line
                        });
                    },
                    'json': function (result) {
                        var blob = new Blob([result], {type: "application/json"});
                        saveAs(blob, "SearchExport.json");  // jshint ignore:line
                    },
                    'xml': function (result) {
                        var zip = new JSZip();  // jshint ignore:line
                        JSON.parse(result).forEach(function (oneElt) {
                            zip.file(oneElt.tinyId + ".xml", JXON.jsToString({element: oneElt}));  // jshint ignore:line
                        });
                        var content = zip.generate({type: "blob"});
                        saveAs(content, "SearchExport_XML.zip");  // jshint ignore:line
                    },
                    'odm': function (result) {
                        var zip = new JSZip();  // jshint ignore:line
                        JSON.parse(result).forEach(function (oneElt) {
                            exports.getFormOdm(oneElt, function (err, odmElt) {
                                if (!err) zip.file(oneElt.tinyId + ".xml", JXON.jsToString({ODM: odmElt}));  // jshint ignore:line
                            });
                        });
                        var content = zip.generate({type: "blob"});
                        saveAs(content, "SearchExport_ODM.zip");  // jshint ignore:line
                    },
                    'validationRules': function(result){
                        var orgName = 'TEST';
                        var cdes = [];
                        JSON.parse(result).forEach(function (oneElt) {
                            //console.log(oneElt);


                            var getOrgRulesForCde = RegStatusValidator.getOrgRulesForCde;
                            var cdeOrgRules = getOrgRulesForCde(oneElt);
                            //$scope.cdeStatusRules = RegStatusValidator.getStatusRules(cdeOrgRules);
                            //
                            //$scope.cdePassingRule = RegStatusValidator.cdePassingRule;
                            if (!RegStatusValidator.conditionsMetForStatusWithinOrg(oneElt, "TEST", "Qualified", cdeOrgRules)) cdes.push(oneElt.tinyId);
                        });
                        console.log(cdes);
                    }
                };
                if (result) {
                    var exporter = exporters[type];
                    if (!exporter) {
                        $scope.addAlert("danger", "This export format is not supported.");
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
            SearchSettings.getPromise().then(function (settings) {
                var result = exports.getCdeCsvHeader(settings.tableViewFields);
                quickBoard.elts.forEach(function (ele) {
                    result += exports.convertToCsv(exports.projectCdeForExport(ele, settings.tableViewFields));
                });

                if (result) {
                    var blob = new Blob([result], {
                        type: "text/csv"
                    });
                    saveAs(blob, 'QuickBoardExport' + '.csv'); // jshint ignore:line
                    $scope.addAlert("success", "Export downloaded.");
                    $scope.feedbackClass = ["fa-download"];
                } else {
                    $scope.addAlert("danger", "Something went wrong, please try again in a minute.");
                }
            });
        };

        $scope.validStatusExport = function(){
            var q = Elastic.buildElasticQuerySettings($scope.searchSettings);
            $http({
                url: "/validationRulesReport"
                , method: "POST"
                , data: q
                , transformResponse: function(a){return a;}
            }).success(function (response) {
                console.log(response)
            })
            .error(function(data, status) {
                if (status === 503) console.log("The server is busy processing similar request, please try again in a minute.");
                else console.log("An error occured. This issue has been reported.");
            });
        };
    }]);