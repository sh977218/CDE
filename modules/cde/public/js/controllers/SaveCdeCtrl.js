angular.module('cdeModule').controller('SaveCdeCtrl', ['$scope', '$timeout', '$http',
    function($scope, $timeout, $http)
{
    // @TODO This controller should be renamed to PV Controller ?

    $scope.srcOptions = {};

    function initSrcOptions() {
        for (var i=0; i < $scope.elt.valueDomain.permissibleValues.length; i++) {
            if ($scope.elt.valueDomain.permissibleValues[i].codeSystemName === 'UMLS') {
                $scope.srcOptions = {
                    NCI: {displayAs: "NCI", termType: "PT", selected: false},
                    LNC: {displayAs: "LOINC", termType: "LA", selected: false}
                };
                Object.keys($scope.srcOptions).forEach(function(srcKey) {
                    $scope.$watch('srcOptions.' + srcKey + ".selected", function() {
                        if ($scope.srcOptions[srcKey].selected) {
                            lookupAsSource(srcKey);
                        }
                    });
                });
                i = $scope.elt.valueDomain.permissibleValues.length;
            }
        }

    }

    $scope.replaceWithUMLS = function () {
        $scope.elt.valueDomain.permissibleValues.forEach(function (pv) {
            if (pv.codeSystemName === 'NCI Thesaurus' || !pv.codeSystemName) {
                $http.get("/umlsBySourceId/NCI/" + pv.valueMeaningCode).then(function(response) {
                    pv.valueMeaningCode = response.data.result.results[0].ui;
                    pv.valueMeaningName = response.data.result.results[0].name;
                    pv.codeSystemName = "UMLS";
                    $scope.stageElt($scope.elt);
                    initSrcOptions();
                });
            }
        });
    };

    var lookupAsSource = function(src) {
        $timeout(function() {
            $scope.elt.valueDomain.permissibleValues.forEach(function(pv) {
                if (pv.codeSystemName === 'UMLS') {
                   $http.get("/umlsAtomsBridge/" + pv.valueMeaningCode + "/" + src).then(function(response) {
                       response.data.result.forEach(function(atom) {
                           if (atom.termType === $scope.srcOptions[src].termType ) {
                               var codeArr = atom.code.split('/');
                               pv[src] = {
                                   valueMeaningName: atom.name,
                                   valueMeaningCode: codeArr[codeArr.length - 1]
                               }
                           }
                       })
                   })
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
    };
    $scope.addPv = function() {
        $scope.elt.valueDomain.permissibleValues.push({permissibleValue: ""});
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