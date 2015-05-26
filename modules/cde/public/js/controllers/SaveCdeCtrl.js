angular.module('cdeModule').controller('SaveCdeCtrl', ['$scope', '$modal', function($scope, $modal) {
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
    
    $scope.movePvUp = function(index) {
        var pvArray = $scope.elt.valueDomain.permissibleValues;
        pvArray.splice(index - 1, 0, pvArray.splice(index, 1)[0]);    
        $scope.stageElt($scope.elt);
    };
    
    $scope.movePvDown = function(index) {
        var pvArray = $scope.elt.valueDomain.permissibleValues;
        pvArray.splice(index + 1, 0, pvArray.splice(index, 1)[0]);    
        $scope.stageElt($scope.elt);
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
        var mongoPv = {
            "permissibleValue": vsacValue.displayName,
            "valueMeaningName": vsacValue.displayName,
            "valueMeaningCode": vsacValue.code,
            "codeSystemName": vsacValue.codeSystemName,
            "codeSystemVersion": vsacValue.codeSystemVersion
        };        
        return mongoPv;
    };

    $scope.changeOtherPleaseSpecify = function() {
        var elt = $scope.elt;
        if (elt.valueDomain.datatypeValueList.otherPleaseSpecify === true) {
            elt.valueDomain.datatypeValueList.otherPleaseSpecifyText = "Other (Please specify)";
        } else {
            delete elt.valueDomain.datatypeValueList.otherPleaseSpecifyText;
        }
        $scope.stageElt(elt);
    };
    
    $scope.openNewNamePair = function () {
        $modal.open({
          templateUrl: 'newNamePairModalContent.html',
          controller: 'NewNamePairModalCtrl',
          resolve: {
              cde: function() {
                  return $scope.elt;
              }
          }
        });
    };  
    
    $scope.stageNewName = function(namePair) {
      $scope.stageElt($scope.elt);
      namePair.editMode = false;
    };
    
    $scope.cancelSave = function(namePair) {
        namePair.editMode = false;
    };
    
    $scope.removeNamePair = function(index) {
        $scope.elt.naming.splice(index, 1);
        $scope.stageElt($scope.elt);          
    };
    
}]);