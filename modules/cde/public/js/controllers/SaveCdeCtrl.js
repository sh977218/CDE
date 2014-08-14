function SaveCdeCtrl($scope, $modal) { 
    $scope.checkVsacId = function(cde) {
        $scope.loadValueSet();
        cde.unsaved = true;
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
            $scope.stageElt($scope.cde);
        }
    };
    
    $scope.removePv = function(index) {
        $scope.cde.valueDomain.permissibleValues.splice(index, 1);
        $scope.stageElt($scope.cde);
        $scope.runManualValidation();
    };
    $scope.addPv = function() {
        $scope.cde.valueDomain.permissibleValues.push({permissibleValue: "Unspecified"});
    };
    
    $scope.movePvUp = function(index) {
        var pvArray = $scope.cde.valueDomain.permissibleValues;
        pvArray.splice(index - 1, 0, pvArray.splice(index, 1)[0]);    
        $scope.stageElt($scope.cde);
    };
    
    $scope.movePvDown = function(index) {
        var pvArray = $scope.cde.valueDomain.permissibleValues;
        pvArray.splice(index + 1, 0, pvArray.splice(index, 1)[0]);    
        $scope.stageElt($scope.cde);
    };
    
    
    $scope.removeVSMapping = function() {
        delete $scope.cde.dataElementConcept.conceptualDomain.vsac;
        $scope.stageElt($scope.cde);
    };
    
    $scope.removeAllPvs = function() {
        $scope.cde.valueDomain.permissibleValues = [];
        $scope.runManualValidation();
        $scope.stageElt($scope.cde);
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
        $scope.cde.valueDomain.permissibleValues.push($scope.convertVsacValueToPv(vsacValue));
        $scope.stageElt($scope.cde);
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
        var cde = $scope.cde;
        if (cde.valueDomain.datatypeValueList.otherPleaseSpecify === true) {
            cde.valueDomain.datatypeValueList.otherPleaseSpecifyText = "Other (Please specify)";
        } else {
            delete cde.valueDomain.datatypeValueList.otherPleaseSpecifyText;
        }
        $scope.stageElt(cde);
    };
    
    $scope.openNewNamePair = function () {
        $modal.open({
          templateUrl: 'newNamePairModalContent.html',
          controller: NewNamePairModalCtrl,
          resolve: {
              cde: function() {
                  return $scope.cde;
              }
          }
        });
    };  
    
    $scope.stageNewName = function(namePair) {
      $scope.stageElt($scope.cde);
      namePair.editMode = false;
    };
    
    $scope.cancelSave = function(namePair) {
        namePair.editMode = false;
    };
    
    $scope.removeNamePair = function(index) {
        $scope.cde.naming.splice(index, 1);
        $scope.stageElt($scope.cde);          
    };
    
};
