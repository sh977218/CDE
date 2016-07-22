angular.module('systemModule').controller('ExportCtrl', ['$scope', 'Elastic', 'SearchSettings', '$http', 'RegStatusValidator', 'userResource', '$uibModal', '$location', '$httpParamSerializer',
    function ($scope, Elastic, SearchSettings, $http, RegStatusValidator, userResource, $modal, $location, $httpParamSerializer) {
        $scope.feedbackClass = ["fa-download"];
        $scope.csvDownloadState = "none";

        $scope.exportSearchResults = function (type, exportSettings) {
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
            Elastic.getExport(Elastic.buildElasticQuerySettings(exportSettings.searchSettings), $scope.module?$scope.module:'cde', function (err, result) {
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
                                cdes.push(record)
                            };
                        });
                        if(exportSettings.cb) exportSettings.cb(cdes);
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



        $scope.displayValidation = function(){
            var org = $scope.searchSettings.selectedOrg;
            var curatorOf = [].concat(userResource.user.orgAdmin).concat(userResource.user.orgCurator);
            return curatorOf.indexOf(org)>-1;
        };

        $scope.openValidRulesModal = function(){
            var modalInstance = $modal.open({
                animation: false,
                templateUrl: '/system/public/html/validRuleExp.html',
                controller: 'ValidRuleExpCtrl',
                resolve: {
                }
            });

            modalInstance.result.then(function (report) {
                report.searchSettings = $scope.searchSettings;
                var uri = $httpParamSerializer(report);
                $location.url('/cdeStatusReport?' + uri);
            }, function(reason) {

            });
        };
    }]);

angular.module('systemModule').controller('ValidRuleExpCtrl', ['$scope', '$uibModalInstance',
    function ($scope, $modalInstance) {
    $scope.status = "Incomplete";
    $scope.export = function(){
        $modalInstance.close({status: $scope.status, org: $scope.selectedOrg});
    };
    $scope.close = function(){
        $modalInstance.dismiss();
    };
}]);

angular.module('systemModule').controller('ShowValidRuleReportCtrl', ['$scope', '$routeParams',
    function ($scope, $routeParams) {
        $routeParams.searchSettings  = JSON.parse($routeParams.searchSettings);
        $scope.gridOptionsReport = {
            columnDefs: [{field: "cdeName", displayName: "CDE Name"}, {field: 'tinyId', displayName: "NLM ID"}]
        };
        $routeParams.cb = function(cdes){
            cdes[0].validationRules.forEach(function(r, i){
                $scope.gridOptionsReport.columnDefs.push({field: 'rule' + i, displayName: r.ruleName});
            });
            var exportFormat = cdes.map(function(cde){
                var output = {cdeName: cde.cdeName, tinyId: cde.tinyId};
                cde.validationRules.forEach(function(rule, i){
                    output['rule' + i] = rule.cdePassingRule?"Yes":"No";
                });
                return output;
            });
            $scope.cdes = exportFormat;
        };
        $scope.module = 'cde';
        $scope.exportSearchResults('validationRules', $routeParams);
    }]);

angular.module('systemModule').controller('SaveValidRuleCtrl', ['$scope', 'OrgHelpers', 'Organization', '$http', '$uibModal',
    function ($scope, OrgHelpers, Organization, $http, $modal) {
        //$scope.rules = [
        //    {
        //        "field" : "stewardOrg.name",
        //        "targetStatus" : "Candidate",
        //        "ruleName" : "CDE has TEST steward (should pass)",
        //        "rule" : {
        //            "regex" : "TEST"
        //        },
        //        "occurence" : "exactlyOne"
        //    },
        //    {
        //        "field" : "stewardOrg.name",
        //        "targetStatus" : "Recorded",
        //        "ruleName" : "CDE has NCI steward (should fail)",
        //        "rule" : {
        //            "regex" : "NCI"
        //        },
        //        "occurence" : "exactlyOne"
        //    },
        //    {
        //        "field" : "stewardOrg.name1",
        //        "targetStatus" : "Recorded",
        //        "ruleName" : "CDE has non-existing field (should fail)",
        //        "rule" : {
        //            "regex" : ".+"
        //        },
        //        "occurence" : "exactlyOne"
        //    },
        //    {
        //        "field" : "properties.key",
        //        "targetStatus" : "Recorded",
        //        "ruleName" : "NINDS Guidelines are recorded (atLeastOne) (should pass)",
        //        "rule" : {
        //            "regex" : "NINDS Guidelines"
        //        },
        //        "occurence" : "atLeastOne"
        //    },
        //    {
        //        "field" : "properties.key",
        //        "targetStatus" : "Recorded",
        //        "ruleName" : "non-existing property is recorded (atLeastOne) (should fail)",
        //        "rule" : {
        //            "regex" : "nonsense"
        //        },
        //        "occurence" : "atLeastOne"
        //    },
        //    {
        //        "field" : "valueDomain.permissibleValues.codeSystemName",
        //        "targetStatus" : "Qualified",
        //        "ruleName" : "All PVs mapped to LOINC (all) (should pass)",
        //        "rule" : {
        //            "regex" : "LOINC"
        //        },
        //        "occurence" : "all"
        //    },
        //    {
        //        "field" : "valueDomain.permissibleValues.permissibleValue",
        //        "targetStatus" : "Qualified",
        //        "ruleName" : "All PVs have a value (all) (should pass)",
        //        "rule" : {
        //            "regex" : ".+"
        //        },
        //        "occurence" : "all"
        //    },
        //    {
        //        "field" : "valueDomain.permissibleValues.permissibleValue",
        //        "targetStatus" : "Qualified",
        //        "ruleName" : "All PVs have LOINC code (all) (should fail)",
        //        "rule" : {
        //            "regex" : "L.+"
        //        },
        //        "occurence" : "all"
        //    }
        //];

        $scope.userOrgs = {};
        $scope.myOrgs.forEach(function(orgName){
            //$scope.userOrgs[orgName] = OrgHelpers.getStatusValidationRules(orgName);
            Organization.getByName(orgName, function(o){
                $scope.userOrgs[orgName] = o.data.cdeStatusValidationRules;
            });
        });
        console.log($scope.userOrgs);
        $scope.removeRule = function(o, i){
            var key = $scope.userOrgs[o][i].field.replace(/[^\w]/g,"")+$scope.userOrgs[o][i].rule.regex.replace(/[^\w]/g,"");
            $http.post('/removeRule', {orgName:o, rule: key}, function(response){
                console.log(response.data);
                console.log('removed');
            });
        };

        $scope.ruleEnabled = function(orgName, rule){
            var ruleIds = $scope.userOrgs[orgName].map(function(rule){return rule.id});
            return ruleIds.indexOf(rule.id) > -1;
        };


        $scope.disableRule = function(orgName, rule){
            var modalInstance = $modal.open({
                //animation: false,
                templateUrl: '/system/public/html/statusRules/removeRule.html',
                controller: 'RemoveRuleCtrl'
            });
            modalInstance.result.then(function () {
                $http.post("/disableRule", {orgName: orgName, rule: rule}).then(function(response){
                    $scope.userOrgs[orgName] = response.data.cdeStatusValidationRules;
                });
            }, function(reason) {

            });

        };
        $scope.enableRule = function(orgName, rule){
            $http.post("/enableRule", {orgName: orgName, rule: rule}).then(function(response){
                $scope.userOrgs[orgName] = response.data.cdeStatusValidationRules;
            });
        };

        $scope.openAddRuleModal = function(){
            var modalInstance = $modal.open({
                animation: false,
                templateUrl: '/system/public/html/statusRules/addNewRule.html',
                controller: 'AddNewRuleCtrl',
                resolve: {
                    myOrgs: function(){return $scope.myOrgs}
                }
            });
            modalInstance.result.then(function (rule) {
                $scope.enableRule(rule.org, rule);
            }, function(reason) {

            });
        };
    }]);

angular.module('systemModule').controller('AddNewRuleCtrl', ['$scope', '$uibModalInstance', 'myOrgs', function($scope, $modalInstance, myOrgs){
    $scope.fields = [
        'stewardOrg.name'
        , 'properties.key'
        , 'valueDomain.permissibleValues.codeSystemName'
        , 'valueDomain.permissibleValues.permissibleValue'
        , 'valueDomain.permissibleValues.valueMeaningName'
        , 'valueDomain.permissibleValues.permissibleValue'
        , 'version'
        , 'ids.version'
        , 'ids.source'
        , 'naming.context.contextName'
        , 'valueDomain.datatype'
        , 'properties.key'
        , 'properties.key'
        , 'properties.key'
    ];
    $scope.myOrgs = myOrgs;
    $scope.cancel = function(){
        $modalInstance.dismiss();
    };
    $scope.saveRule = function(){
        var msg = {
            occurence: $scope.occurence
            , targetStatus: $scope.targetStatus
            , ruleName: $scope.ruleName
            , rule: {regex: $scope.regex}
            , field: $scope.field
            , id: Math.random()
            , org: $scope.org
        };
        $modalInstance.close(msg);
    };
}]);

angular.module('systemModule').controller('RemoveRuleCtrl', ['$scope', '$uibModalInstance', function($scope, $modalInstance){
    $scope.cancel = function(){
        $modalInstance.dismiss();
    };
    $scope.deleteRule = function(){
        $modalInstance.close();
    };
}]);