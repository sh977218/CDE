function QuickBoardCtrl($scope, $location, DataElement) {
    $scope.setActiveMenu('QUICKBOARD');
    
    $scope.quickBoardView = true;
    $scope.cdes = [];
    
    $scope.gridCdes = [];
    $scope.gridOptions = {
        data: 'gridCdes'
        , enableColumnResize: true
        , enableRowReordering: true
        , enableCellSelection: true
    };
    
    $scope.isAllOpen = false;
    
    $scope.isAccordionView = true;
    
    $scope.openCloseAll = function() {
        $scope.isAllOpen = !$scope.isAllOpen;
        
        for (var i = 0; i < $scope.cdes.length; i++) {
            $scope.cdes[i].isOpen = $scope.isAllOpen;
        }
    };
    
    $scope.gotoCompare = function() {
        if ($scope.cdes.length !== 2) {
            $scope.addAlert("danger", "You can only compare 2 CDEs.")
        } else {
            $location.url( 'deCompare' );
        }
    };
    
    $scope.removeDE = function( index ) {
        $scope.cdes.splice(index, 1);
        $scope.compareCart.splice(index, 1);
    };
    
    if ($scope.compareCart.length >= 1) {
        for (var i = 0; i < $scope.compareCart.length; i++) {
            DataElement.get({deId: $scope.compareCart[i]}, function (de) {
                $scope.cdes.push(de);
                if ($scope.cdes.length === 2) {
                    $scope.comparePvs($scope.cdes[1].valueDomain.permissibleValues, $scope.cdes[0].valueDomain.permissibleValues);
                    $scope.comparePvs($scope.cdes[0].valueDomain.permissibleValues, $scope.cdes[1].valueDomain.permissibleValues);
                }
            });
        }
    }

    $scope.comparePvs = function(list1, list2) {
        for (var i = 0; i < list1.length; i++) {
           $scope.isPvInList(list1[i], list2, function(wellIsIt) {
                list1[i].isValid = wellIsIt;
           });
        }
    };
    
    $scope.showAccordionView = function() {
        $scope.isAccordionView = !$scope.isAccordionView;
    };
    
    $scope.showGridView = function() {
        $scope.isAccordionView = !$scope.isAccordionView;
        
        $scope.gridCdes = [];
        for( var i in $scope.cdes ) {
            var cde = $scope.cdes[i];
            var thisCde = 
            {
                ID: cde.uuid
                , Version: cde.version
                , Name: cde.naming[0].designation
                , Definition: cde.naming[0].definition
                , Steward: cde.stewardOrg.name
                , "OriginId": cde.originId 
                , Origin: cde.origin
                , "RegistrationStatus": cde.registrationState.registrationStatus
           };
           var otherNames = "";
           for (var j = 1; j < cde.naming.length; j++) {
               otherNames = otherNames.concat(" " + cde.naming[j].designation);
           } 
           thisCde.otherNames = otherNames;

           var permissibleValues = "";
           for (var j = 0; j < cde.valueDomain.permissibleValues.length; j++) {
               permissibleValues = permissibleValues.concat(cde.valueDomain.permissibleValues[j].permissibleValue + "; ");
           } 
           thisCde.permissbleValues = permissibleValues;

           $scope.gridCdes.push(thisCde);               
        }
    };
    
};
