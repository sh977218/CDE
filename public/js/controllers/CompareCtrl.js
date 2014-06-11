function CompareCtrl($scope, DataElement) {
    $scope.setActiveMenu('COMPARE');
    
    $scope.compareView = true;
    $scope.cdes = [];
    $scope.pvLimit = 30;
    
    $scope.initCache();
    $scope.openAllCompareModel = $scope.cache.get("openAllCompare");
    //console.debug( "$scope.openAllCompareModel right after cache.get: "+$scope.openAllCompareModel );
    
    $scope.openAllCompare = function( newValue ) {
        $scope.openAllCompareModel = newValue;

        //console.debug( "$scope.openAllCompareModel: "+$scope.openAllCompareModel );

        for (var i = 0; i < $scope.cdes.length; i++) {
            $scope.cdes[i].isOpen = $scope.openAllCompareModel;
        }
        $scope.cache.put("openAllCompare", $scope.openAllCompareModel);
    };
    
    $scope.isAllowed = function(cde) {
        return false;
    };
    
    if ($scope.quickBoard.length >= 2) {
        for (var i = 0; i < $scope.quickBoard.length; i++) {
            DataElement.get({deId: $scope.quickBoard[i]}, function (de) {
                $scope.cdes.push(de);
                if ($scope.cdes.length === 2) {
                    $scope.comparePvs($scope.cdes[1].valueDomain.permissibleValues, $scope.cdes[0].valueDomain.permissibleValues);
                    $scope.comparePvs($scope.cdes[0].valueDomain.permissibleValues, $scope.cdes[1].valueDomain.permissibleValues);
                }
            });
        }
    }
        
    function lowerCompare(item1, item2) {
        if (item1 === undefined && item2 === undefined) {
            return true;
        } else if (item1 === undefined || item2 === undefined) {
            return false;
        } else {
            return item1.toLowerCase() === item2.toLowerCase();
        }
    }    
        
    $scope.isPvInList = function(pv, list, callback) {
        for (var i = 0; i < list.length; i++) {
            if (lowerCompare(pv.permissibleValue, list[i].permissibleValue) &&
                pv.valueMeaningCode === list[i].valueMeaningCode && 
                pv.codeSystemName === list[i].codeSystemName &&
                lowerCompare(pv.valueMeaningName, list[i].valueMeaningName)) {
                    return callback(true);
            }
        }
        return callback(false);
    };
    
    $scope.comparePvs = function(list1, list2) {
        for (var i = 0; i < list1.length; i++) {
           $scope.isPvInList(list1[i], list2, function(wellIsIt) {
                list1[i].isValid = wellIsIt;
           });
        }
    }; 
};
