function QuickBoardCtrl($scope, $location, CdeList) {
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
    
    $scope.gotoCompare = function() {
        if ($scope.cdes.length !== 2) {
            $scope.addAlert("danger", "You may only compare 2 CDEs side by side.");
        } else {
            $location.url( 'deCompare' );
        }
    };
    
    $scope.removeDE = function( index ) {
        $scope.cdes.splice(index, 1);
        $scope.quickBoard.splice(index, 1);
    };
    
    $scope.emptyQuickBoardAndScreen = function() {
        $scope.emptyQuickBoard();
        $scope.cdes = [];
        $scope.gridCdes = [];
    };
    
    if ($scope.quickBoard.length >= 1) {
        CdeList.byUuidList($scope.quickBoard, function(result) {
           if(result) {
                $scope.cdes = [];
                for (var i = 0; i < $scope.quickBoard.length; i++) {
                   for (var j = 0; j < result.length; j++) {
                       if ($scope.quickBoard[i] === result[j].uuid) {
                           $scope.cdes.push(result[j]);
                       }
                   }
                }
               $scope.openCloseAll($scope.cdes, "quickboard");
           }
        });
    }
    
    $scope.showAccordionView = function() {
        $scope.isAccordionView = !$scope.isAccordionView;
    };
    
    $scope.showCompareButton = function(cde) {
        return false;
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
