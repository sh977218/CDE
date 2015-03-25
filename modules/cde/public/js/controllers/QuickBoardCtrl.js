angular.module('cdeModule').controller('QuickBoardCtrl', ['$scope', 'CdeList', 'CdeGridView', function($scope, CdeList, CdeGridView) {
    
    $scope.viewType = {
        accordion : true
        , grid : false
        , sidebyside : false
    };

    $scope.gridOptions = CdeGridView.gridOptions;

    $scope.cdes = [];
    $scope.qbGridCdes = [];
    
    $scope.showAccordionView = function() {
        $scope.viewType.accordion = true;
        $scope.viewType.grid = false;
        $scope.viewType.sidebyside = false;
    };

    $scope.showGridView = function() {
        $scope.viewType.accordion = false;
        $scope.viewType.grid = true;
        $scope.viewType.sidebyside = false;
        
        $scope.gridCdes = [];
        for( var i in $scope.cdes ) {
            var cde = $scope.cdes[i];
            var thisCde = CdeGridView.cdeToExportCde(cde);
           $scope.gridCdes.push(thisCde);
        }
    };
    
    $scope.showSideBySideView = function() {
        if ($scope.cdes.length !== 2) {
            $scope.addAlert("danger", "You may only compare 2 CDEs side by side.");
        } else {
            $scope.viewType.accordion = false;
            $scope.viewType.grid = false;
            $scope.viewType.sidebyside = true;      
        }
    };
    
    $scope.removeDE = function( index ) {
        $scope.cdes.splice(index, 1);
        $scope.quickBoard.splice(index, 1);
    };
    
    $scope.emptyQuickBoardAndScreen = function() {
        $scope.emptyQuickBoard();
        $scope.cdes = [];
        $scope.qbGridCdes = [];
    };

    if ($scope.quickBoard.length > 0) {
        CdeList.byTinyIdList($scope.quickBoard, function(result) {
           if(result) {
                $scope.cdes = [];
                for (var i = 0; i < $scope.quickBoard.length; i++) {
                   for (var j = 0; j < result.length; j++) {
                       if ($scope.quickBoard[i] === result[j].tinyId) {
                           $scope.cdes.push(result[j]);
                       }
                   }
                }
               $scope.openCloseAll($scope.cdes, "quickboard");
           }
        });
    }
    
}]);