angular.module('cdeModule').controller('PermissibleValuesCtrl', ['$scope', '$timeout', '$http', '$uibModal', '$q',
    function($scope, $timeout, $http, $modal, $q)
{
    var defaultSrcOptions = {
        NCI: {displayAs: "NCI", termType: "PT", selected: false},
        UMLS: {displayAs: "UMLS", termType: "PT", selected: false},
        LNC: {displayAs: "LOINC", termType: "LA", selected: false, disabled: !$scope.user._id},
        SNOMEDCT_US: {displayAs: "SNOMEDCT US", termType: "PT", selected: false, disabled: !$scope.user._id}
    };

    var externalSources = ['NCI', 'LNC']

    var displayAsArray = [];

    Object.keys(defaultSrcOptions).forEach(function(srcKey) {
        displayAsArray.push(srcKey);
        $scope.$watch('srcOptions.' + srcKey + ".selected", function() {
            if ($scope.srcOptions[srcKey] && $scope.srcOptions[srcKey].selected) {
                lookupAsSource(srcKey);
            }
        });
    });

    $scope.$on('elementReloaded', function(){
        Object.keys($scope.srcOptions).forEach(function(k){
            if ($scope.srcOptions[k].selected) lookupAsSource(k);
        });
    });

    $scope.srcOptions = {};
    $scope.containsKnownSystem = false;
    $scope.srcOptions = JSON.parse(JSON.stringify(defaultSrcOptions));
    function initSrcOptions() {
        for (var i=0; i < $scope.elt.valueDomain.permissibleValues.length; i++) {
            if (displayAsArray.indexOf($scope.elt.valueDomain.permissibleValues[i].codeSystemName) > -1) {
                $scope.containsKnownSystem = true;
                i = $scope.elt.valueDomain.permissibleValues.length;
            }
        }
    }

    var umlsFromOther = function(code, system, cb) {
        var cuis = [];
        $http.get("/umlsCuiFromSrc/" + code + "/" + system).success(function (response) {
            if (response.result && response.result.results) {
                response.result.results.forEach(function (result) {
                    cuis.push({
                        valueMeaningName: result.name,
                        valueMeaningCode: result.ui
                    });
                });
            }
            cb(null, cuis);
        });
    };


    var umlsLookup = function() {
        function joinCodes(cuisArrs) {
            cuisArrs.map(function(a) {
                return a.join(":");
            }).join(":");
        }

        $timeout(function () {
            $scope.elt.valueDomain.permissibleValues.forEach(function (pv) {
                if (externalSources.indexOf(pv.codeSystemName) > -1) {
                    var funcArray = [];
                    pv.valueMeaningCode.split(":").forEach(function (pvCode, i) {
                        funcArray[i] = $q.defer();
                        umlsFromOther(pvCode, pv.codeSystemName, function (err, cuis) {
                            funcArray[i].resolve(cuis);
                        });
                    });
                    $q.all(funcArray.map(function (d) {
                        return d.promise;
                    })).then(function (arrRes) {
                        pv.UMLS = {
                            valueMeaningCode: joinCodes(arrRes)
                        };
                        // set results here
                    });
                }
            });
        }, 0);
    };

    umlsLookup(function(err, codes) {
        console.log(codes);
    });

    var lookupAsSource = function(src) {
        $timeout(function() {
            $scope.elt.valueDomain.permissibleValues.forEach(function(pv) {
                if (displayAsArray.indexOf(pv.codeSystemName) > -1) {
                    var newCodes = [];
                    pv[src] = {
                        valueMeaningName: "Retrieving...",
                        valueMeaningCode: "Retrieving..."
                    };
                    var todo = pv.valueMeaningCode.split(":").length;
                    pv.valueMeaningCode.split(":").forEach(function (pvCode, i) {
                        if (pv.codeSystemName === 'UMLS') {
                            $http.get("/umlsAtomsBridge/" + pvCode + "/" + src).success(function (response) {
                                var termFound = false;
                                todo--;
                                if (response.result) {
                                    response.result.forEach(function (atom) {
                                        if (!termFound && atom.termType === $scope.srcOptions[src].termType) {
                                            var srcConceptArr = atom.sourceConcept.split('/');
                                            var code = srcConceptArr[srcConceptArr.length - 1];
                                            newCodes[i] = {
                                                valueMeaningName: atom.name,
                                                valueMeaningCode: code
                                            };
                                            termFound = true;
                                        }
                                    });
                                    if (!termFound) {
                                        newCodes[i] = {
                                            valueMeaningName: "N/A",
                                            valueMeaningCode: "N/A"
                                        };
                                    }
                                    if (todo === 0) {
                                        pv[src] = {
                                            valueMeaningName: newCodes.map(function (c) {
                                                    return c.valueMeaningName;
                                                })
                                                .join(" "),
                                            valueMeaningCode: newCodes.map(function (c) {
                                                    return c.valueMeaningCode;
                                                })
                                                .join(":")
                                        };
                                    }
                                } else {
                                    pv[src] = {
                                        valueMeaningName: "Not Found",
                                        valueMeaningCode: "Not Found"
                                    };
                                }
                            });
                        }
                         else if (src === "UMLS") {
                            $http.get("/umlsCuiFromSrc/" + pvCode + "/" + pv.codeSystemName).success(function (response) {
                                if (response.result && response.result.results) {
                                    todo--;
                                    response.result.results.forEach(function (result) {
                                            newCodes.push({
                                                valueMeaningName: result.name,
                                                valueMeaningCode: result.ui
                                            });
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }, 0);
    };

    initSrcOptions();

    $scope.checkVsacId = function(elt) {
        $scope.loadValueSet();
        elt.unsaved = true;
    };
    
    $scope.attachPv = function(pv) {
        var code = "null";
        for (var i = 0; i < $scope.vsacValueSet.length && code === "null"; i++) {
            if (pv.valueMeaningName === $scope.vsacValueSet[i].displayName) {
                code = $scope.vsacValueSet[i];
            }
        }
        if (code !== "null") {
            pv.valueMeaningName = code.displayName;
            pv.valueMeaningCode = code.code;
            pv.codeSystemName = code.codeSystemName;
            $scope.stageElt($scope.elt);
        }
    };
    
    $scope.removePv = function(index) {
        $scope.elt.valueDomain.permissibleValues.splice(index, 1);
        $scope.stageElt($scope.elt);
        $scope.runManualValidation();
        initSrcOptions();
    };

    $scope.addPv = function() {
        var modalInstance = $modal.open({
            animation: false,
            templateUrl: '/cde/public/html/AddPvModal.html',
            controller: 'NewPvModalCtrl'
        });

        modalInstance.result.then(function (newPv) {
            $scope.elt.valueDomain.permissibleValues.push(newPv);
            $scope.stageElt($scope.elt);
            initSrcOptions();
            $scope.runManualValidation();


        });
    };

    $scope.canAddPv = function() {
        var result = true;
        $scope.elt.valueDomain.permissibleValues.forEach(function(pv){
            if (pv.permissibleValue === "") result = false;
        });
        return result;
    };

    $scope.removeVSMapping = function() {
        delete $scope.elt.dataElementConcept.conceptualDomain.vsac;
        $scope.stageElt($scope.elt);
    };
    
    $scope.removeAllPvs = function() {
        $scope.elt.valueDomain.permissibleValues = [];
        $scope.runManualValidation();
        $scope.stageElt($scope.elt);
    };  
    
    $scope.addAllVsac = function () {
        for (var i=0; i<$scope.vsacValueSet.length; i++) { 
            $scope.addVsacValue($scope.vsacValueSet[i]);
        }        
    };
    
    $scope.addVsacValue = function(vsacValue) {
        if ($scope.isVsInPv(vsacValue)) {
            return;
        }
        $scope.elt.valueDomain.permissibleValues.push($scope.convertVsacValueToPv(vsacValue));
        $scope.stageElt($scope.elt);
        $scope.runManualValidation();
    };    
    
    $scope.convertVsacValueToPv = function(vsacValue) {
        return {
            "permissibleValue": vsacValue.displayName,
            "valueMeaningName": vsacValue.displayName,
            "valueMeaningCode": vsacValue.code,
            "codeSystemName": vsacValue.codeSystemName,
            "codeSystemVersion": vsacValue.codeSystemVersion
        };        
    };

}]);