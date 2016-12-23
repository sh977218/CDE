angular.module('systemModule').controller('ExportCtrl', ['$scope', 'Elastic', 'SearchSettings', '$http',
    'RegStatusValidator', 'userResource', '$uibModal', '$httpParamSerializer', '$window',
    function ($scope, Elastic, SearchSettings, $http, RegStatusValidator, userResource, $modal, $httpParamSerializer, $window) {
        $scope.feedbackClass = ["fa-download"];
        $scope.csvDownloadState = "none";

        $scope.exportSearchResults = function (type, exportSettings) {
            if (!exportSettings) exportSettings = {searchSettings: $scope.searchSettings};
            if ($scope.module === 'form' && (!$scope.user || !$scope.user._id)) {
                return $scope.Alert.addAlert("danger", "Please login to access this feature");
            }

            try {
                !!new Blob; //jshint ignore:line
            } catch (e) {
                return $scope.addAlert("danger", "Export feature is not supported in this browser. Please try " +
                    "Google Chrome or Mozilla FireFox.");
            }
            $scope.feedbackClass = ['fa-spinner', 'fa-pulse'];
            if (type !== 'validationRules') $scope.addAlert("warning", "Your export is being generated, please wait.");
            Elastic.getExport(Elastic.buildElasticQuerySettings(exportSettings.searchSettings), $scope.module?$scope.module:'cde',
                function (err, result) {
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
                        var orgName = exportSettings.searchSettings.selectedOrg;
                        var status = exportSettings.status;
                        var cdes = [];
                        JSON.parse(result).forEach(function (oneElt) {
                            var getOrgRulesForCde = RegStatusValidator.getOrgRulesForCde;
                            var cdeOrgRules = getOrgRulesForCde(oneElt);

                            if (!RegStatusValidator.conditionsMetForStatusWithinOrg(oneElt, orgName, status, cdeOrgRules)) {
                                var record = {
                                    tinyId: oneElt.tinyId
                                    , cdeName: oneElt.naming[0].designation
                                    , validationRules: RegStatusValidator.evalCde(oneElt, orgName, status, cdeOrgRules)
                                };
                                if (!record.validationRules.every(function(x){return x.cdePassingRule;})) cdes.push(record);
                            }
                        });
                        if(exportSettings.cb) exportSettings.cb(cdes.slice(0, 100));
                    }
                };
                if (result) {
                    var exporter = exporters[type];
                    if (!exporter) {
                        $scope.addAlert("danger", "This export format is not supported.");
                    } else {
                        exporter(result);
                        if (type !== 'validationRules') $scope.addAlert("success", "Export downloaded.");
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

        $scope.displayValidation = function(){
            var org = $scope.searchSettings.selectedOrg;
            var curatorOf = [].concat(userResource.user.orgAdmin).concat(userResource.user.orgCurator);
            return curatorOf.indexOf(org)>-1 || exports.hasRole(userResource.user, "OrgAuthority");
        };

        $scope.openValidRulesModal = function(){
            $modal.open({
                animation: false,
                templateUrl: '/system/public/html/validRuleExp.html',
                controller: 'ValidRuleExpCtrl',
                resolve: {
                }
            }).result.then(function (report) {
                report.searchSettings = $scope.searchSettings;
                delete report.searchSettings.resultPerPage;
                var uri = $httpParamSerializer(report);
                $window.location.href = '/cdeStatusReport?' + uri;
            });
        };
    }]);
