angular.module('cdeModule').controller('SaveCdeCtrl', ['$scope', '$timeout', '$http',
    function($scope, $timeout, $http)
{

    // This controller shoudl be rename to PV Controller ?

    //$scope.umls = {};

    $scope.selectedMappings = {
        NCI: false,
        LNC: false
    };

    $scope.$watch('selectedMappings.NCI', function() {
        if ($scope.selectedMappings.NCI) lookupAsSource('NCI');
    });
    $scope.$watch('selectedMappings.LNC', function() {
        if ($scope.selectedMappings.LNC) lookupAsSource('LNC');
    });



    $scope.sourceOptions = [
        {displayAs: "NCI", source: "NCI", termType: "PT"},
        {displayAs: "LOINC", source:"LNC", termType: "LA"}
    ];

    $scope.replaceWithUMLS = function () {
        $scope.elt.valueDomain.permissibleValues.forEach(function (pv) {
            if (pv.codeSystemName === 'NCI Thesaurus') {
                $http.get("/umlsBySourceId/NCI/" + pv.valueMeaningCode).then(function(response) {
                    pv.valueMeaningCode = response.data.result.results[0].ui;
                    pv.valueMeaningName = response.data.result.results[0].name;
                    pv.codeSystemName = "UMLS";
                    $scope.stageElt($scope.elt);
                });
            } else if (!pv.codeSystemName) {
                $http.get("/umlsBySourceId/NCI/" + pv.valueMeaningCode).then(function(response) {
                    if (pv.valueMeaningName.toLowerCase() === response.data.result.results[0].name.toLowerCase()) {
                        pv.valueMeaningCode = response.data.result.results[0].ui;
                        pv.codeSystemName = "UMLS";
                        $scope.stageElt($scope.elt);
                    }
                });
            }
        })
    };

    var lookupAsSource = function(src) {
        $timeout(function() {
            $scope.elt.valueDomain.permissibleValues.forEach(function(pv) {
                if (pv.codeSystemName === 'UMLS') {
                   $http.get("/umlsAtomsBridge/" + pv.valueMeaningCode + "/" + src).then(function(response) {
                       response.data.result.forEach(function(atom) {
                           if (atom.termType === "PT" || atom.termType === "LA" ) {
                               var codeArr = atom.code.split('/');
                               pv[src] = {
                                   valueMeaningName: atom.name,
                                   valueMeaningCode: codeArr[codeArr.length - 1],
                                   codeSystemName: "NCI Thesaurus/LOINC"
                               }
                           }
                       })
                   })
                }
            });
        }, 0);
    };

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