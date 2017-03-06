angular.module('cdeModule').controller('PermissibleValuesCtrl', ['$scope', '$timeout', '$http', '$uibModal', '$q', 'userResource',
    function($scope, $timeout, $http, $modal, $q, userResource)
{
    var defaultSrcOptions = {
        NCI: {displayAs: "NCI Thesaurus", termType: "PT", selected: false},
        UMLS: {displayAs: "UMLS", termType: "PT", selected: false},
        LNC: {displayAs: "LOINC", termType: "LA", selected: false, disabled: true},
        SNOMEDCT_US: {displayAs: "SNOMEDCT US", termType: "PT", selected: false, disabled: true}
    };

    var displayAs = {'NCI Thesaurus': "NCI", 'LOINC': "LNC", "SNOMEDCT US": "SNOMEDCT_US"};

    Object.keys(defaultSrcOptions).forEach(function(srcKey) {
        $scope.$watch('srcOptions.' + srcKey + ".selected", function() {
            if ($scope.srcOptions[srcKey] && $scope.srcOptions[srcKey].selected) {
                lookupAsSource(srcKey);
            }
        });
    });

    function loadSrcOptions() {
        Object.keys($scope.srcOptions).forEach(function(k){
            if ($scope.srcOptions[k].selected) lookupAsSource(k);
        });
    }
    if ($scope.deferredEltLoaded) {
        $scope.deferredEltLoaded.promise.then(loadSrcOptions);
    }
    $scope.$on('elementReloaded', loadSrcOptions);

    $scope.srcOptions = {};
    $scope.containsKnownSystem = false;
    $scope.srcOptions = JSON.parse(JSON.stringify(defaultSrcOptions));

    userResource.getPromise().then(function() {
        $scope.srcOptions.LNC.disabled = !userResource.user._id;
        $scope.srcOptions.SNOMEDCT_US.disabled = !userResource.user._id;
    });
    function initSrcOptions() {
        $scope.containsKnownSystem = false;
        for (var i=0; i < $scope.elt.valueDomain.permissibleValues.length; i++) {
            if (displayAs[$scope.elt.valueDomain.permissibleValues[i].codeSystemName] ||
                $scope.elt.valueDomain.permissibleValues[i].codeSystemName === 'UMLS') {
                $scope.containsKnownSystem = true;
                i = $scope.elt.valueDomain.permissibleValues.length;
            }
        }
    }

    var umlsFromOther = function(code, system, cb) {
        var cuis = [];
        $http.get("/umlsCuiFromSrc/" + code + "/" + system).then(function onSuccess(response) {
            if (response.data.result && response.data.result.results) {
                response.data.result.results.forEach(function (result) {
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
        $scope.elt.valueDomain.permissibleValues.forEach(function (pv) {
            if (pv.codeSystemName !== "UMLS") {
                var system = displayAs[pv.codeSystemName];
                if (system) {
                    var funcArray = [];
                    pv.valueMeaningCode.split(":").forEach(function (pvCode, i) {
                        funcArray[i] = $q.defer();
                        umlsFromOther(pvCode, system, function (err, cuis) {
                            funcArray[i].resolve(cuis);
                        });
                    });
                    $q.all(funcArray.map(function (d) {
                        return d.promise;
                    })).then(function (arrRes) {
                        pv.UMLS = {
                            valueMeaningCode: arrRes.map(function (arr) {
                                return arr.map(function (a) {
                                    return a.valueMeaningCode;
                                }).join(":");
                            }).join(":"),
                            valueMeaningName: arrRes.map(function (arr) {
                                return arr.map(function (a) {
                                    return a.valueMeaningName;
                                }).join(":");
                            }).join(":")
                        };
                    });
                }
            }
        });
    };

    var dupCodesForSameSrc = function(src) {
        $scope.elt.valueDomain.permissibleValues.forEach(function (pv) {
            if(pv.codeSystemName === defaultSrcOptions[src].displayAs) {
                pv[src] = {valueMeaningName: pv.valueMeaningName, valueMeaningCode: pv.valueMeaningCode};
            }
        });
    };

    var lookupAsSource = function(src) {
        $timeout(function() {
            dupCodesForSameSrc(src);
            if (src === 'UMLS') {
                umlsLookup();
            } else {
                $scope.elt.valueDomain.permissibleValues.forEach(function (pv) {
                    if (pv.codeSystemName === "UMLS" || (displayAs[pv.codeSystemName] && src !== displayAs[pv.codeSystemName])) {
                        var newCodes = [];
                        pv[src] = {
                            valueMeaningName: "Retrieving...",
                            valueMeaningCode: "Retrieving..."
                        };
                        //var todo = pv.valueMeaningCode.split(":").length;
                        var funcArray = [];
                        pv.valueMeaningCode.split(":").forEach(function (pvCode, i) {
                            var def = $q.defer();

                            if (pv.codeSystemName !== "UMLS") {
                                umlsFromOther(pvCode, displayAs[pv.codeSystemName], function(err, cuis) {
                                    var resolve = cuis[0]?cuis[0].valueMeaningCode:"Not Found";
                                    def.resolve(resolve);
                                });
                            } else {
                                def.resolve(pvCode);
                            }
                            def.promise.then(function(newCode) {
                                if (newCode === "Not Found") {
                                    pv[src] = {
                                        valueMeaningName: "N/A",
                                        valueMeaningCode: "N/A"
                                    };
                                } else {
                                    funcArray[i] = $q.defer();
                                    $http.get("/umlsAtomsBridge/" + newCode + "/" + src).then(function onSuccess(response) {
                                        funcArray[i].resolve(response.data);
                                    });
                                    $q.all(funcArray.map(function(d) {return d.promise;})).then(function(arrOfResponses) {
                                        arrOfResponses.forEach(function(response, i) {
                                            var termFound = false;
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
                                            } else {
                                                newCodes[i] = {
                                                    valueMeaningName: "N/A",
                                                    valueMeaningCode: "N/A"
                                                };
                                            }
                                        });
                                        pv[src] = {
                                            valueMeaningCode: newCodes.map(function (a) {
                                                return a.valueMeaningCode;
                                            }).join(":"),
                                            valueMeaningName: newCodes.map(function (a) {
                                                return a.valueMeaningName;
                                            }).join(":")
                                        };
                                    });
                                }
                            });
                        });
                    }
                });
            }
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
        $modal.open({
            animation: false,
            templateUrl: '/cde/public/html/AddPvModal.html',
            controller: 'NewPvModalCtrl'
        }).result.then(function (newPv) {
            $scope.elt.valueDomain.permissibleValues.push(newPv);
            $scope.stageElt($scope.elt);
            initSrcOptions();
            $scope.runManualValidation();
        }, function () {});
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