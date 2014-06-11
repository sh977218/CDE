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
    
    /*$scope.openCloseAll = function() {
        $scope.isAllOpen = !$scope.isAllOpen;

        for (var i = 0; i < $scope.cdes.length; i++) {
            $scope.cdes[i].isOpen = $scope.isAllOpen;
        }
    };*/
    
    
        
    
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
    }
    
    if ($scope.quickBoard.length >= 1) {
        for (var i = 0; i < $scope.quickBoard.length; i++) {
            DataElement.get({deId: $scope.quickBoard[i]}, function (de) {
                $scope.cdes.push(de);
                $scope.openCloseAll($scope.cdes, "quickboard");
            });
        }
    }
    
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
